import { Feather } from '@expo/vector-icons';
import { View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import { useTheme } from 'react-native-paper';

export default function ErrorMessage({ message }: { message: string }) {

    const theme = useTheme<any>();

    const styles = makeStyles(theme);

    return (
        <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color={theme.colors.error} />
            <Text variant="bodySmall" style={styles.errorText}>
                {message}
            </Text>
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centers the error message under the button
        marginTop: theme.spacing.sm,
        gap: 8,
        // Optional: Adding a very light red background makes it pop
        backgroundColor: theme.colors.errorBackground, 
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    errorText: {
        color: theme.colors.text.error,
        fontWeight: '600',
    },
});