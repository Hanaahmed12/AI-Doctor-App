import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    preferredName: "",
    age: "",
    gender: "",
    birthDate: "",
    email: "",
    phone: ""
  });
  const [medications, setMedications] = useState([]);
  const [isNewUser, setIsNewUser] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("patientProfile");
      const savedMeds = await AsyncStorage.getItem("patientMedications");
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setIsNewUser(false);
        if (parsedProfile.firstName || parsedProfile.lastName) {
          setIsEditing(false);
        }
      }
      if (savedMeds) setMedications(JSON.parse(savedMeds));
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveProfileData = async () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      Alert.alert("Missing Information", "Please enter at least your first and last name.");
      return;
    }

    try {
      await AsyncStorage.setItem("patientProfile", JSON.stringify(profile));
      await AsyncStorage.setItem("patientMedications", JSON.stringify(medications));
      Alert.alert("Success", "Profile saved successfully!");
      setIsEditing(false);
      setIsNewUser(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      saveProfileData();
    } else {
      setIsEditing(true);
    }
  };

  const addMedication = () => {
    setMedications(prev => [...prev, {
      name: "",
      prescriber: "",
      dosage: "",
      frequency: "",
      status: "active"
    }]);
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setMedications(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const deleteMedication = (index: number) => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setMedications(prev => prev.filter((_, i) => i !== index))
        }
      ]
    );
  };

  const renderField = (label: string, value: string, field: keyof typeof profile, placeholder?: string, required: boolean = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      {isEditing ? (
        <TextInput
          value={value}
          onChangeText={(text) => setProfile(prev => ({ ...prev, [field]: text }))}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
      ) : (
        <Text style={[styles.fieldValue, !value && styles.emptyField]}>
          {value || "Not provided"}
        </Text>
      )}
    </View>
  );

  const renderMedicationField = (medication: any, index: number, field: string, label: string, placeholder: string) => (
    <View style={styles.medFieldContainer}>
      <Text style={styles.medFieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          value={medication[field]}
          onChangeText={(text) => updateMedication(index, field, text)}
          style={styles.medInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
      ) : (
        <Text style={[styles.medFieldValue, !medication[field] && styles.emptyField]}>
          {medication[field] || "Not specified"}
        </Text>
      )}
    </View>
  );

  const clearProfile = () => {
    Alert.alert(
      "Clear Profile",
      "Are you sure you want to clear all your profile information?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            setProfile({
              firstName: "",
              middleName: "",
              lastName: "",
              preferredName: "",
              age: "",
              gender: "",
              birthDate: "",
              email: "",
              phone: ""
            });
            setMedications([]);
            setIsEditing(true);
            AsyncStorage.removeItem("patientProfile");
            AsyncStorage.removeItem("patientMedications");
          }
        }
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isNewUser ? "Create Your Profile" : "Your Profile"}
          </Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditToggle}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {isNewUser && isEditing && (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome! 👋</Text>
            <Text style={styles.welcomeText}>
              Let's set up your profile. Please enter your information below. 
              Fields marked with * are required.
            </Text>
          </View>
        )}

        {/* Profile Picture Section */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={28} color="#666" />
              </View>
            </View>
            <View style={styles.nameContainer}>
              {isEditing ? (
                <TextInput
                  value={profile.preferredName}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, preferredName: text }))}
                  style={styles.nameInput}
                  placeholder="What should we call you?"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.preferredName}>
                  {profile.preferredName || "Please enter your name"}
                </Text>
              )}
              <Text style={styles.fullName}>
                {profile.firstName && profile.lastName 
                  ? `${profile.firstName} ${profile.lastName}`
                  : "Your full name will appear here"
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.nameRow}>
            {renderField("First Name", profile.firstName, "firstName", "Enter your first name", true)}
            {renderField("Last Name", profile.lastName, "lastName", "Enter your last name", true)}
          </View>
          
          <View style={styles.nameRow}>
            {renderField("Middle Name", profile.middleName, "middleName", "Optional")}
            {renderField("Preferred Name", profile.preferredName, "preferredName", "Enter preferred name")}
          </View>
          
          {renderField("Age", profile.age, "age", "Your age")}
          {renderField("Gender", profile.gender, "gender", "Your gender identity")}
          {renderField("Birth Date", profile.birthDate, "birthDate", "YYYY-MM-DD")}
          {renderField("Email", profile.email, "email", "your.email@example.com")}
          {renderField("Phone", profile.phone, "phone", "(xxx) xxx-xxxx")}
        </View>

        {/* Active Medications Card */}
        <View style={styles.card}>
          <View style={styles.medicationHeader}>
            <Text style={styles.sectionTitle}>
              Active Medications {medications.length > 0 && `(${medications.length})`}
            </Text>
            {isEditing && (
              <TouchableOpacity onPress={addMedication} style={styles.addMedButton}>
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {medications.length === 0 && !isEditing && (
            <Text style={styles.noDataText}>No medications added yet</Text>
          )}

          <View style={styles.medicationsList}>
            {medications.map((medication, index) => (
              <View key={index} style={styles.medicationCard}>
                <View style={styles.medicationHeaderRow}>
                  {isEditing ? (
                    <TextInput
                      value={medication.name}
                      onChangeText={(text) => updateMedication(index, 'name', text)}
                      style={styles.medicationNameInput}
                      placeholder="Medication name"
                      placeholderTextColor="#999"
                    />
                  ) : (
                    <Text style={styles.medicationName}>
                      {medication.name || "Unnamed medication"}
                    </Text>
                  )}
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => deleteMedication(index)}
                      style={styles.deleteMedButton}
                    >
                      <MaterialIcons name="delete-outline" size={18} color="#e04f5f" />
                    </TouchableOpacity>
                  )}
                </View>

                {renderMedicationField(medication, index, 'prescriber', 'Prescriber', 'Doctor or healthcare provider')}
                {renderMedicationField(medication, index, 'dosage', 'Dosage', 'e.g., 500mg')}
                {renderMedicationField(medication, index, 'frequency', 'Frequency', 'e.g., Once daily')}
                
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={[
                    styles.statusBadge,
                    medication.status === 'active' ? styles.statusActive : styles.statusInactive
                  ]}>
                    <Text style={styles.statusText}>{medication.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {isEditing && medications.length === 0 && (
            <TouchableOpacity onPress={addMedication} style={styles.addFirstMedButton}>
              <Ionicons name="add-circle-outline" size={18} color="#4a90e2" />
              <Text style={styles.addFirstMedText}>Add your first medication</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Clear Profile Button */}
        {!isNewUser && (
          <TouchableOpacity onPress={clearProfile} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All Profile Data</Text>
          </TouchableOpacity>
        )}

        {/* Extra padding at bottom */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: "#f2f4f7" 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18, 
    fontWeight: "700",
    color: "#333",
  },
  editButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13, 
  },
  welcomeCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
  },
  welcomeTitle: {
    fontSize: 16, 
    fontWeight: "700",
    color: "#1565c0",
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 13, 
    color: "#1565c0",
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 14,
  },
  profileImagePlaceholder: {
    width: 60, 
    height: 60, 
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  nameContainer: {
    flex: 1,
  },
  preferredName: {
    fontSize: 16, 
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  fullName: {
    fontSize: 13, 
    color: "#666",
  },
  nameInput: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 2,
  },
  sectionTitle: {
    fontSize: 16, 
    fontWeight: "700",
    marginBottom: 14,
    color: "#333",
  },
  nameRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12, 
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  required: {
    color: "#e04f5f",
  },
  fieldValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    paddingVertical: 6,
  },
  emptyField: {
    color: "#999",
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14, 
    color: "#333",
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addMedButton: {
    backgroundColor: "#3c884bff",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  medicationsList: {
    gap: 10,
  },
  medicationCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
  },
  medicationHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 14, 
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  medicationNameInput: {
    fontSize: 14, 
    fontWeight: "700",
    color: "#333",
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteMedButton: {
    padding: 2,
    marginLeft: 6,
  },
  medFieldContainer: {
    marginBottom: 6,
  },
  medFieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
  },
  medFieldValue: {
    fontSize: 12, 
    color: "#333",
    fontWeight: "500",
  },
  medInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12, 
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: "#d4edda",
  },
  statusInactive: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#155724",
  },
  noDataText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
    fontSize: 13,
  },
  addFirstMedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#4a90e2",
    borderStyle: "dashed",
    borderRadius: 8,
    gap: 6,
  },
  addFirstMedText: {
    color: "#4a90e2",
    fontWeight: "600",
    fontSize: 14, 
  },
  clearButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  clearButtonText: {
    color: "#e04f5f",
    fontWeight: "600",
    fontSize: 14,
  },
  bottomPadding: {
    height: 20,
  },
});