import Map "mo:core/Map";

module {
  type HealthRecord = {
    firstName : Text;
    lastName : Text;
    age : Nat;
    bmi : Float;
    bloodPressure : Nat;
    glucose : Nat;
    hemoglobin : Float;
    cholesterol : Nat;
    gender : Gender;
    isSmoker : Bool;
    riskScore : Float;
    timestamp : Int;
  };

  type Gender = {
    #male;
    #female;
  };

  type OldActor = {
    records : Map.Map<Text, HealthRecord>;
  };

  type NewActor = {
    records : Map.Map<Text, HealthRecord>;
  };

  public func run(old : OldActor) : NewActor {
    {
      records = old.records;
    };
  };
};
