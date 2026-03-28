import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { IService } from '@auto-hub/shared/types/serviceTypes';

interface ServiceCardProps {
    service: IService;
    onEdit: (service: IService) => void;
    onDelete: (serviceId: string) => void;
}

export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
    const theme = useTheme<any>();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border?.light || '#E5E7EB' }]}>
            
            {/* TOP ROW: Name, Price, and Actions */}
            <View style={styles.topRow}>
                <Text style={[styles.serviceName, { color: theme.colors.text.main }]}>
                    {service.name}
                </Text>
                
                <View style={styles.actionRow}>
                    <Text style={[styles.price, { color: theme.colors.text.main }]}>
                        {service.price} RON
                    </Text>
                    
                    <TouchableOpacity onPress={() => onEdit(service)} style={[styles.iconButton, { backgroundColor: theme.colors.background }]}>
                        <Ionicons name="pencil-outline" size={16} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => onDelete(service._id)} style={[styles.iconButton, { backgroundColor: theme.colors.errorBackground || '#FEE2E2' }]}>
                        <Ionicons name="trash-outline" size={16} color={theme.colors.error || '#EF4444'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* MIDDLE ROW: Description */}
            {service.description ? (
                <Text style={[styles.description, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                    {service.description}
                </Text>
            ) : null}

            {/* BOTTOM ROW: Duration & Status */}
            <View style={styles.bottomRow}>
                {service.duration ? (
                    <View style={styles.durationBadge}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.text.muted} />
                        <Text style={[styles.durationText, { color: theme.colors.text.muted }]}>
                            {service.duration} min
                        </Text>
                    </View>
                ) : <View />}

                {/* Optional: Show an indicator if the service is hidden */}
                {!service.isActive && (
                    <Text style={[styles.inactiveText, { color: theme.colors.text.placeholder }]}>
                        Inactiv
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        // Optional subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        marginRight: 4,
    },
    iconButton: {
        padding: 6,
        borderRadius: 8,
    },
    description: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    durationText: {
        fontSize: 13,
        fontWeight: '500',
    },
    inactiveText: {
        fontSize: 12,
        fontWeight: '600',
        fontStyle: 'italic',
    }
});