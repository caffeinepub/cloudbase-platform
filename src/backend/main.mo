import MixinStorage "blob-storage/Mixin";
import ExternalBlob "blob-storage/Storage";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let GB = 1024 * 1024 * 1024;
  let DEFAULT_STORAGE_LIMIT = 15 * GB;
  let MAX_FILE_SIZE = 2 * GB;

  type UserProfile = {
    principal : Principal;
    storageLimit : Nat;
    usedStorage : Nat;
    isBlocked : Bool;
    createdAt : Int;
  };

  type UserRecord = {
    userId : Principal;
    email : Text;
    storageLimit : Nat;
    usedStorage : Nat;
    isBlocked : Bool;
    createdAt : Int;
    role : Text;
  };

  type FileRecord = {
    id : Text;
    owner : Principal;
    name : Text;
    size : Nat;
    mimeType : Text;
    uploadDate : Int;
    blob : ExternalBlob.ExternalBlob;
  };

  type StorageStats = {
    totalUsers : Nat;
    totalFiles : Nat;
    totalStorageUsed : Nat;
  };

  let files = Map.empty<Text, FileRecord>();
  let users = Map.empty<Principal, UserRecord>();

  func validateMimeType(mimeType : Text) {
    let allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "video/mp4"];
    let iter = allowedTypes.values();
    let found = iter.any(func(t) { t == mimeType });
    if (not found) {
      Runtime.trap("Unsupported MIME type: " # mimeType);
    };
  };

  public shared ({ caller }) func registerUser(email : Text) : async UserRecord {
    switch (users.get(caller)) {
      case (?existing) { return existing };
      case null {
        let isFirstUser = users.size() == 0;
        let role = if (isFirstUser) { "admin" } else { "user" };

        let userRecord : UserRecord = {
          userId = caller;
          email;
          storageLimit = DEFAULT_STORAGE_LIMIT;
          usedStorage = 0;
          isBlocked = false;
          createdAt = Time.now();
          role;
        };

        users.add(caller, userRecord);

        if (isFirstUser) {
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
        } else {
          AccessControl.assignRole(accessControlState, caller, caller, #user);
        };

        userRecord;
      };
    };
  };

  public query ({ caller }) func getUserProfile() : async UserRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (users.get(caller)) {
      case (null) { null };
      case (?record) {
        ?{
          principal = record.userId;
          storageLimit = record.storageLimit;
          usedStorage = record.usedStorage;
          isBlocked = record.isBlocked;
          createdAt = record.createdAt;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?existing) {
        let updated : UserRecord = {
          userId = existing.userId;
          email = existing.email;
          storageLimit = profile.storageLimit;
          usedStorage = profile.usedStorage;
          isBlocked = profile.isBlocked;
          createdAt = profile.createdAt;
          role = existing.role;
        };
        users.add(caller, updated);
      };
    };
  };

  public query ({ caller }) func getUserProfile_compat(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?record) {
        ?{
          principal = record.userId;
          storageLimit = record.storageLimit;
          usedStorage = record.usedStorage;
          isBlocked = record.isBlocked;
          createdAt = record.createdAt;
        };
      };
    };
  };

  public shared ({ caller }) func uploadFile(name : Text, size : Nat, blob : ExternalBlob.ExternalBlob, mimeType : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    let user = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?u) { u };
    };

    if (user.isBlocked) { Runtime.trap("User is blocked") };

    if (size > MAX_FILE_SIZE) {
      Runtime.trap("File exceeds 2GB size limit");
    };

    validateMimeType(mimeType);

    if (user.usedStorage + size > user.storageLimit) {
      Runtime.trap("User has reached the storage limit");
    };

    let id = name # " " # Time.now().toText();
    let record : FileRecord = {
      id;
      owner = caller;
      name;
      size;
      mimeType;
      uploadDate = Time.now();
      blob;
    };

    files.add(id, record);

    let updatedUser : UserRecord = { user with usedStorage = user.usedStorage + size };
    users.add(caller, updatedUser);

    id;
  };

  public query ({ caller }) func getFile(id : Text) : async FileRecord {
    switch (files.get(id)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        if (file.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only file owners and admins can view file");
        };
        file;
      };
    };
  };

  public query ({ caller }) func getUserFiles() : async [FileRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their files");
    };
    let userFiles = List.empty<FileRecord>();
    let iter = files.values();
    iter.forEach(
      func(file) {
        if (file.owner == caller) { userFiles.add(file) };
      }
    );
    userFiles.toArray();
  };

  public shared ({ caller }) func deleteFile(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };
    switch (files.get(id)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        if (file.owner != caller) {
          Runtime.trap("Unauthorized: Only file owners can delete file");
        };
        files.remove(id);
        switch (users.get(caller)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser : UserRecord = {
              userId = user.userId;
              email = user.email;
              storageLimit = user.storageLimit;
              usedStorage = if (user.usedStorage >= file.size) {
                user.usedStorage - file.size;
              } else { 0 };
              isBlocked = user.isBlocked;
              createdAt = user.createdAt;
              role = user.role;
            };
            users.add(caller, updatedUser);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [UserRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    let userList = List.empty<UserRecord>();
    let iter = users.values();
    iter.forEach(func(user) { userList.add(user) });
    userList.toArray();
  };

  public query ({ caller }) func getAllFiles() : async [FileRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all files");
    };
    let fileList = List.empty<FileRecord>();
    let iter = files.values();
    iter.forEach(func(file) { fileList.add(file) });
    fileList.toArray();
  };

  public shared ({ caller }) func adminDeleteFile(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete any file");
    };

    switch (files.get(id)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        files.remove(id);
        switch (users.get(file.owner)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser : UserRecord = {
              userId = user.userId;
              email = user.email;
              storageLimit = user.storageLimit;
              usedStorage = if (user.usedStorage >= file.size) {
                user.usedStorage - file.size;
              } else { 0 };
              isBlocked = user.isBlocked;
              createdAt = user.createdAt;
              role = user.role;
            };
            users.add(file.owner, updatedUser);
          };
        };
      };
    };
  };

  public shared ({ caller }) func blockUser(userId : Principal, blocked : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can block users");
    };
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile : UserRecord = { profile with isBlocked = blocked };
        users.add(userId, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getTotalStorageStats() : async StorageStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view storage stats");
    };
    let iter = files.values();
    let stats = iter.foldLeft(
      { totalFiles = 0; totalStorageUsed = 0 },
      func(acc, file) {
        { totalFiles = acc.totalFiles + 1; totalStorageUsed = acc.totalStorageUsed + file.size };
      },
    );
    {
      totalUsers = users.size();
      totalFiles = stats.totalFiles;
      totalStorageUsed = stats.totalStorageUsed;
    };
  };

  public query ({ caller }) func getUser() : async UserProfile {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?record) {
        {
          principal = record.userId;
          storageLimit = record.storageLimit;
          usedStorage = record.usedStorage;
          isBlocked = record.isBlocked;
          createdAt = record.createdAt;
        };
      };
    };
  };
};
