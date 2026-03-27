import SignUpScreen from "@/components/Authentification/SignUpScreen";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function SignUp() {


  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SignUpScreen />
    </View>
  );
}