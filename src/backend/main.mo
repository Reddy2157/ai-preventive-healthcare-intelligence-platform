import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

actor {
  type HealthRecord = {
    patientName : Text;
    age : Nat;
    bmi : Float;
    bloodPressure : Nat;
    glucose : Nat;
    hemoglobin : Float;
    cholesterol : Nat;
    gender : Gender;
    isSmoker : Bool;
    riskScore : Float;
    riskLevel : RiskLevel;
    timestamp : Time.Time;
  };

  type Gender = {
    #male;
    #female;
  };

  type RiskLevel = {
    #low;
    #moderate;
    #high;
  };
  // This persistent variable preserves its state across upgrades
  var records = Map.empty<Text, HealthRecord>();

  public shared ({ caller }) func addRecord(
    patientName : Text,
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
    let riskLevel = determineRiskLevel(riskScore);

    let record : HealthRecord = {
      patientName;
      age;
      bmi;
      bloodPressure;
      glucose;
      hemoglobin;
      cholesterol;
      gender;
      isSmoker;
      riskScore;
      riskLevel;
      timestamp = Time.now();
    };

    let recordId = generateRecordId(record.timestamp);
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

  public query ({ caller }) func getRecordsByPatientName(searchName : Text) : async [HealthRecord] {
    let matches = List.empty<HealthRecord>();
    for ((_, record) in records.entries()) {
      if (record.patientName.toLower().contains(#text(searchName.toLower()))) {
        matches.add(record);
      };
    };
    matches.toArray();
  };

  public shared ({ caller }) func deleteRecord(recordId : Text) : async Bool {
    if (records.containsKey(recordId)) {
      records.remove(recordId);
      true;
    } else {
      false;
    };
  };

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

    if (age >= 20 and age <= 100) {
      risk += (age - 20).toFloat() / 80.0 * 20.0;
    };

    risk += if (bmi < 25.0) { 0.0 } else if (bmi < 30.0) { 7.5 } else { 15.0 };

    risk += if (bloodPressure < 120) {
      0.0;
    } else if (bloodPressure < 140) {
      7.5;
    } else { 15.0 };

    risk += if (glucose < 110) {
      0.0;
    } else if (glucose < 140) {
      7.5;
    } else { 15.0 };

    risk += if (cholesterol < 200) {
      0.0;
    } else if (cholesterol < 250) {
      7.5;
    } else { 15.0 };

    risk += if (hemoglobin >= 12.0) {
      0.0;
    } else if (hemoglobin >= 10.0) {
      10.0;
    } else { 20.0 };

    if (isSmoker) {
      risk += 20.0;
    };

    Float.min(risk, 100.0);
  };

  func determineRiskLevel(riskScore : Float) : RiskLevel {
    if (riskScore < 33.3) {
      #low;
    } else if (riskScore < 66.6) {
      #moderate;
    } else { #high };
  };

  func generateRecordId(timestamp : Time.Time) : Text {
    timestamp.toText();
  };
};
