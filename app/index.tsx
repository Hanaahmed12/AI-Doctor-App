import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from "react-native";
import { useState } from "react";
import {router } from "expo-router";
import {Ionicons} from "@expo/vector-icons";


export default function Page() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [passwordVisible, setPasswordVisible] = useState(false);

const togglePassword= () => setPasswordVisible(prev => !prev);


const handleLogin = () => {
  if(email && password) {
    router.push("/ChatIntroScreen");
  } else {
    alert("Please enter email and password");
  }

};

return(
  <View style={styles.container}>
    <View style={styles.main}>
     <Text style={styles.title}>Login</Text>
    
     <View style={styles.inputRow}>
      <TextInput
       style={[styles.input, {color: "#000"}]}
       placeholder="Email"
       placeholderTextColor="#888"
       keyboardType="email-address"
       value={email}
       onChangeText={setEmail} 
       autoCapitalize="none"
       
     />
     </View>
     

     {/* Password field with eye icon */}
     <View style={styles.inputRow}>
      <TextInput
      style={styles.input}
      placeholder="Password"
      placeholderTextColor="#fafafaff"
      secureTextEntry = {!passwordVisible}
      value={password}
      onChangeText={setPassword}
      autoCapitalize="none"
      textContentType="password"
      importantForAutofill="yes"
     />

     <TouchableOpacity
     onPress={togglePassword}
     activeOpacity={0.7}
     accessible={true}
     accessibilityLabel={passwordVisible ? "Hide password": "show password"}
     accessibilityRole="button"
     style={styles.iconButton}
     >
      <Ionicons
      name={passwordVisible ? "eye": "eye-off"}
      size={22}
      color="#333"
      />
      </TouchableOpacity>
      </View>

     <TouchableOpacity style={styles.button} onPress={handleLogin}>
      <Text style={styles.buttonText}>Sign In</Text>
     </TouchableOpacity>
     </View>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a8c2dbff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },


  main: {
    width:"100%",
    maxWidth: 400,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#fff",
    borderColor: "#d1c4c4ffs",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },

  iconButton:{
  position: "absolute",
  right: 12,
  width: 36,
  height: 36,
  alignItems: "center",
},

  button: {
    backgroundColor: "#5284b3ff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: { color: "#ffffffff", fontSize: 16, fontWeight: "600"},

});