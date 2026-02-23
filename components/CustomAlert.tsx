import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';

const { width } = Dimensions.get('window');

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title?: string;
    message: string;
    buttons?: AlertButton[];
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    onClose,
}) => {
    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        onClose();
    };

    const getButtonStyle = (style?: string) => {
        switch (style) {
            case 'destructive':
                return styles.buttonDestructive;
            case 'cancel':
                return styles.buttonCancel;
            default:
                return styles.buttonDefault;
        }
    };

    const getButtonTextStyle = (style?: string) => {
        switch (style) {
            case 'destructive':
                return styles.buttonTextDestructive;
            case 'cancel':
                return styles.buttonTextCancel;
            default:
                return styles.buttonTextDefault;
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            animationIn="bounceIn"
            animationOut="bounceOut"
            animationInTiming={400}
            animationOutTiming={300}
            backdropTransitionInTiming={400}
            backdropTransitionOutTiming={300}
            backdropOpacity={0.5}
            useNativeDriver={true}
        >
            <View style={styles.container}>
                <View style={styles.alertBox}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    <Text style={styles.message}>{message}</Text>

                    <View style={[
                        styles.buttonContainer,
                        buttons.length > 2 && styles.buttonContainerVertical
                    ]}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    getButtonStyle(button.style),
                                    buttons.length <= 2 && { flex: 1 },
                                    buttons.length === 2 && index === 0 && { marginRight: 10 },
                                    buttons.length > 2 && index > 0 && { marginTop: 12 },
                                ]}
                                onPress={() => handleButtonPress(button)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.buttonText, getButtonTextStyle(button.style)]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        width: width * 0.85,
        backgroundColor: '#FFE1EE',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#8F6277',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#DDB0C4',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8F6277',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#8F6277',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    buttonContainerVertical: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    buttonDefault: {
        backgroundColor: '#8F6277',
    },
    buttonCancel: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#8F6277',
    },
    buttonDestructive: {
        backgroundColor: '#D64550',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextDefault: {
        color: '#FFFFFF',
    },
    buttonTextCancel: {
        color: '#8F6277',
    },
    buttonTextDestructive: {
        color: '#FFFFFF',
    },
});

export default CustomAlert;
