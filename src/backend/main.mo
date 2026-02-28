import MixinStorage "blob-storage/Mixin";
import ExternalBlob "blob-storage/Storage";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  include MixinStorage();

  type FileRecord = {
    id : Text;
    name : Text;
    size : Nat;
    mimeType : Text;
    blob : ExternalBlob.ExternalBlob;
  };

  var uploadCount = 0;
  let fileRecords = List.empty<FileRecord>();

  public shared ({ caller }) func uploadFile(name : Text, size : Nat, mimeType : Text, blob : ExternalBlob.ExternalBlob) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required to upload files");
    };

    let id = name.concat(uploadCount.toText());
    let record : FileRecord = {
      id;
      name;
      size;
      mimeType;
      blob;
    };

    fileRecords.add(record);
    uploadCount += 1;
    id;
  };

  public query ({ caller }) func getUploadCount() : async Nat {
    uploadCount;
  };

  public query ({ caller }) func listFiles() : async [FileRecord] {
    fileRecords.toArray();
  };

  public query ({ caller }) func getFile(id : Text) : async FileRecord {
    switch (fileRecords.values().find(func(record) { record.id == id })) {
      case (null) { Runtime.trap("File not found") };
      case (?record) { record };
    };
  };
};
