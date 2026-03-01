import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import ExternalBlob "blob-storage/Storage";

module {
  type OldFileRecord = {
    id : Text;
    name : Text;
    size : Nat;
    mimeType : Text;
    blob : ExternalBlob.ExternalBlob;
  };

  type OldActor = {
    var fileRecords : List.List<OldFileRecord>;
    var uploadCount : Nat;
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

  type NewActor = {
    files : Map.Map<Text, FileRecord>;
    users : Map.Map<Principal, UserRecord>;
  };

  public func run(_old : OldActor) : NewActor {
    let users = Map.empty<Principal, UserRecord>();
    let files = Map.empty<Text, FileRecord>();
    { files; users };
  };
};
