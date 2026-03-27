import { useAuth } from "@/context/AuthContext";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Services() {


  const {user, logout} = useAuth();
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
      <Text>Services</Text>
    </View>
  );
} 