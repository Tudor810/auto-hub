import ForgotPasswordScreen from "@/components/Authentification/ForgotPassword";
import { View } from "react-native";

export default function ForgotPassword() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ForgotPasswordScreen />
    </View>
  );
}