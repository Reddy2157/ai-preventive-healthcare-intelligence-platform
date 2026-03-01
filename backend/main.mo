import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
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
    timestamp : Time.Time;
  };

  type Gender = {
    #male;
    #female;
  };

  // Only a "var Map" can survive upgrades
  var records = Map.empty<Text, HealthRecord>();

  public shared ({ caller }) func addRecord(
    firstName : Text,
    lastName : Text,
    age : Nat,
    bmi : Float,
    bloodPressure : Nat,
    glucose : Nat,
    hemoglobin : Float,
    cholesterol : Nat,
    gender : Gender,
    isSmoker : Bool,
  ) : async Text {
    let riskScore = calculateRisk(
      age,
      bmi,
      bloodPressure,
      glucose,
      hemoglobin,
      cholesterol,
      isSmoker,
    );
    let record : HealthRecord = {
      firstName;
      lastName;
      age;
      bmi;
      bloodPressure;
      glucose;
      hemoglobin;
      cholesterol;
      gender;
      isSmoker;
      riskScore;
      timestamp = Time.now();
    };

    let recordId = generateRecordId(firstName, lastName, record.timestamp);
    records.add(recordId, record);
    recordId;
  };

  public query ({ caller }) func getAllRecords() : async [HealthRecord] {
    records.values().toArray();
  };

  public query ({ caller }) func getRecordById(recordId : Text) : async HealthRecord {
    switch (records.get(recordId)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?record) { record };
    };
  };

  // Helper function to calculate risk score
  func calculateRisk(
    age : Nat,
    bmi : Float,
    bloodPressure : Nat,
    glucose : Nat,
    hemoglobin : Float,
    cholesterol : Nat,
    isSmoker : Bool,
  ) : Float {
    var risk : Float = 0.0;

    // Age factor
    if (age >= 20 and age <= 100) {
      risk += (age - 20).toFloat() / 80.0 * 20.0;
    };

    // BMI factor
    risk += if (bmi < 25.0) { 0.0 } else if (bmi < 30.0) { 7.5 } else { 15.0 };

    // Blood Pressure factor
    risk += if (bloodPressure < 120) {
      0.0;
    } else if (bloodPressure < 140) {
      7.5;
    } else { 15.0 };

    // Glucose factor
    risk += if (glucose < 110) {
      0.0;
    } else if (glucose < 140) {
      7.5;
    } else { 15.0 };

    // Cholesterol factor
    risk += if (cholesterol < 200) {
      0.0;
    } else if (cholesterol < 250) {
      7.5;
    } else { 15.0 };

    // Hemoglobin factor
    risk += if (hemoglobin >= 12.0) {
      0.0;
    } else if (hemoglobin >= 10.0) {
      10.0;
    } else { 20.0 };

    // Smoking factor
    if (isSmoker) {
      risk += 20.0;
    };

    if (risk > 100.0) { 100.0 } else { risk };
  };

  // Helper function to generate a unique record ID
  func generateRecordId(
    firstName : Text,
    lastName : Text,
    timestamp : Time.Time,
  ) : Text {
    firstName.concat(lastName).concat(timestamp.toText());
  };
};
