import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from "expo-calendar";

export default function ChatIntroScreen() {
  const [tasks, setTasks] = useState<string[]>([
    "Take morning vitamins",
    "Measure blood pressure",
  ]);
  const [newTask, setNewTask] = useState("");
  const insets = useSafeAreaInsets();

  
  useEffect(() => {
    (async () => {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    })();
  }, []);

  
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  
  const addTaskToCalendar = async (task: string) => {
    try {
      console.log("Starting calendar integration...");
      
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow calendar access to get real notifications for your reminders.");
        return;
      }

     
      const calendars = await Calendar.getCalendarsAsync();
      console.log("Available calendars:", calendars.length);
      
      // Find a calendar that allows modifications
      const defaultCalendar = calendars.find(cal => 
        cal.allowsModifications && 
        cal.isVisible !== false
      );

      if (!defaultCalendar) {
        Alert.alert("No Calendar Found", "Please make sure you have a calendar app installed (Google Calendar, Apple Calendar, etc.)");
        return;
      }

      console.log("Using calendar:", defaultCalendar.title);

      
      const startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() + 5); // 5 minutes from now for testing
      
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min event

      const eventDetails = {
        title: `${task}`,
        startDate: startDate,
        endDate: endDate,
        timeZone: 'GMT',
        alarms: [
          { relativeOffset: -2 * 60 }, // 2 minutes before (for testing)
          { relativeOffset: -15 * 60 }, // 15 minutes before
          { relativeOffset: -60 * 60 }  // 1 hour before
        ],
        location: "Health App Reminder",
        notes: `Health reminder: ${task}`,
        availability: Calendar.Availability.BUSY
      };

      console.log("Creating calendar event...");
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      if (eventId) {
        console.log("Event created successfully:", eventId);
        Alert.alert(
           "Reminder Set!", 
          `"${task}" was added to your calendar with notifications! You'll get alerts before it's time.`
        );
        return true;
      }
    } catch (error) {
      console.error("Calendar error details:", error);
      Alert.alert(
        "Calendar Error", 
        "Couldn't add to calendar. Make sure you have a calendar app installed and try again."
      );
    }
    return false;
  };

  
  const handleAddTask = async () => {
    if (!newTask.trim()) {
      Alert.alert("Empty Field", "Please enter a reminder before adding.");
      return;
    }
    
    const taskText = newTask.trim();
    setNewTask(""); 
    
   
    setTasks(prev => [...prev, taskText]);
    
    // Try to add to calendar
    const calendarSuccess = await addTaskToCalendar(taskText);
    
    if (!calendarSuccess) {
      Alert.alert(
        "Local Reminder Added", 
        "Added to your app reminders. Enable calendar access for notifications."
      );
    }
  };

  const handleDeleteTask = (index: number) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setTasks(prev => prev.filter((_, i) => i !== index))
        }
      ]
    );
  };

 const handleCall = () => {
  Alert.alert(
    "Emergency Services",
    "Which emergency number would you like to call?",
    [
      {
        text: "911 (US Emergency)",
        onPress: () => callEmergency("911")
      },
      {
        text: "112 (International)",
        onPress: () => callEmergency("112")
      },
      {
        text: "Cancel",
        style: "cancel"
      }
    ]
  );
};

const callEmergency = (number: string) => {
  const phoneNumber = `tel:${number}`;
  Linking.openURL(phoneNumber).catch(() =>
    Alert.alert("Error", "Could not open the phone dialer.")
  );
};

  const handleFieldVisit = () => {
    const url = "https://www.google.com/maps/search/hospitals+near+me";
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open Maps.")
    );
  };

  const handleOpenChat = () => {
    router.push("/chat");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapper}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}> 
          
         
          <Text style={styles.header}>Welcome back👋 </Text>

          
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.optionButton} onPress={handleCall}>
              <Ionicons name="call-outline" size={22} color="#fff" />
              <Text style={styles.optionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleFieldVisit}>
              <MaterialIcons name="place" size={22} color="#fff" />
              <Text style={styles.optionText}>Field Visit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.chatButton]}
              onPress={handleOpenChat}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
              <Text style={styles.optionText}>Chat</Text>
            </TouchableOpacity>
            </View>
          
          <TouchableOpacity
          style={[styles.optionButton, styles.profileButton]}
          onPress={() => router.push("/profile")}
            >
             <Ionicons name="person-outline" size={22} color="#fff" />
    <Text style={styles.optionText}>Account</Text>
  </TouchableOpacity>

          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Performance Chart</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={{ color: "#666", textAlign: 'center' }}>
                Chart Coming Soon 📊{'\n'}
                <Text style={{ fontSize: 12 }}>Your health metrics will appear here</Text>
              </Text>
            </View>
          </View>

         
          <View style={styles.card}>
            <View style={styles.reminderHeader}>
              <Text style={styles.sectionTitle}>Your Reminders</Text>
              <Text style={styles.reminderSubtitle}>set and manage you health reminders</Text>
            </View>

            <View style={styles.tasksList}>
              {tasks.map((item, index) => (
                <View key={index} style={styles.taskRow}>
                  <View style={styles.taskLeft}>
                    <Ionicons name="notifications-outline" size={20} color="#4a90e2" />
                    <Text style={styles.taskText}>{item}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTask(index)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#e04f5f" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            
            <View style={styles.addRow}>
              <TextInput
                value={newTask}
                onChangeText={setNewTask}
                placeholder="Add a new reminder (vitamins, meditation, etc.)"
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={handleAddTask}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f2f4f7" },
  container: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingBottom: 20, 
  },

  profileButton: {
    backgroundColor: '#9159c1',
    marginTop: 6,
  },

  header: {
    fontSize: 26, 
    fontWeight: "800", 
    marginBottom: 8, 
    color: "#222",
    alignSelf: "center",
    textAlign: 'center',
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16, 
    gap: 6, 
    flexWrap: "wrap",
  },
  optionButton: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: "#4a90e2",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chatButton: {
     backgroundColor: "#3c884bff"
     },

  optionText: { 
    color: "#fff", 
    fontWeight: "700", 
    marginTop: 4,
    fontSize: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 14, 
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  reminderHeader: {
    marginBottom: 12,
  },
  reminderSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 4, 
    color: "#333",
  },
  chartPlaceholder: {
    height: 120, 
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  tasksList: {
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  taskLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    flex: 1, 
    marginRight: 12,
  },
  taskText: { 
    marginLeft: 12, 
    fontSize: 15, 
    color: "#333",
    flex: 1,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  addRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 14,
  },
});