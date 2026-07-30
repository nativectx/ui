import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "@nativectx/ui";

interface MyButtonProps {
  onPress: () => void;
  text: string;
}

export const MyButton = ({ onPress, text }: MyButtonProps) => {
  const theme = useTheme();
  return (
    <TouchableOpacity style={[styles.container, { borderRadius: theme.borderRadius.sm }]} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 8,
    backgroundColor: "purple",
    alignSelf: "flex-start",
  },
  text: { color: "white", fontSize: 16, fontWeight: "bold" },
});
