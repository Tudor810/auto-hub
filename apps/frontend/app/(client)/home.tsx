import { useAuth } from "@/context/AuthContext";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Home() {


  const { user, logout } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <Button mode="contained" onPress={() => logout()}>
        Logout
      </Button>
      <Text>Home</Text>
      <Text>Welcome, {user?.fullName}!</Text>
      <Text>This is your dashboard.</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Role: {user?.role}</Text>

    </View>
  );
} 