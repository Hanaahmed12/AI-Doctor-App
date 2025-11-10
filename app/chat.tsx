import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../ai-doctor-fixed/constants/theme";


  interface ChatMessage{
    id: number;
    text: string;
    fromUser: boolean;
  }
   

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);


const fakeApiResponse = async (userMessage: string) : Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const symptoms = ["fever","headache", "cough", "cold"];
        const detected = symptoms.filter((s) =>
          userMessage.toLowerCase().includes(s)
      );

      if (detected.length > 0) {
        resolve(
          "Bot: Based on your symptoms, you have " +
          detected.join(", ")
        );
      } else {
        resolve("Bot: Thanks for the info! can you tell me more?");
      }
    }, 1000);
  });
};

const sendMessage= async () => {
  if (!message.trim()) return;

  const newMessage: ChatMessage = {
    id: Date.now(),
    text: message, 
    fromUser: true,
  };

  setChat((prev) => [...prev, newMessage]);
  setMessage("");

  const botText = await fakeApiResponse(message);
  const botMessage: ChatMessage = {
    id: Date.now() +1 ,
    text: botText,
    fromUser: false,
  };
  setChat((prev) => [...prev, botMessage]);
};



  return (
    
    <SafeAreaView style={styles.safeArea}>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 20 : 60} 
      >
        <View style={styles.container}>
          <Text style={styles.title}>AI Doctor Chat</Text>

        
          <ScrollView
  style={styles.chatArea}
  contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", paddingBottom: 10 }}
  showsVerticalScrollIndicator={false}
>
  {chat.map((msg) => (
    <View
      key={msg.id}
      style={[
        styles.messageBubble,
        msg.fromUser ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={msg.fromUser ? styles.userText : styles.botText}>
        {msg.text}
      </Text>
    </View>
  ))}
  </ScrollView>
 

          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your symptoms..."
              value={message}
              onChangeText={setMessage}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: "700",
    marginBottom:20,
    alignSelf:"center",
  },
  chatArea: {
    flex: 1,
    marginBottom:10,
  },

  messageBubble : {
    padding : 10,
    borderRadius: 10,
    marginBottom: 5, 
    maxWidth: "75%"
  },

  userText: {
    color: "white"
},

botText: {
  color: "#333"
},
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4a90e2",
    color: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: width*0.75, 
  },
  botBubble: { 
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
    padding: 10,
    marginBottom: 5,
    borderRadius: 10,
    maxWidth: "75%",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#ffffffff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: Math.max(40, height * 0.06),
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#4a90e2",
    borderRadius: 20,
    paddingHorizontal: 20,
    height: Math.max(40, height * 0.06),
    justifyContent: "center",
  },
  sendText: {
    color: "white",
    fontWeight: "600",
  },
});

