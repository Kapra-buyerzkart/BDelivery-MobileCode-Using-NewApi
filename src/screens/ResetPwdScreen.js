import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    Alert,
} from 'react-native';
import { AppColors } from '../constants/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { Fonts } from '../constants/Fonts';
import LoaderComponent from '../components/LoaderComponent';
import AlertComponent from '../components/AlertComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { changePwd, logout, resetPwd } from '../services/api/api';

const { width } = Dimensions.get('window');

const ResetPwdScreen = ({ navigation, route }) => {
    const { resetToken } = route?.params || {};
    const [agentId, setAgentId] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPwdVisible, setOldPwdVisible] = useState(false);
    const [newPwdVisible, setNewPwdVisible] = useState(false);
    const [confirmPwdVisible, setConfirmPwdVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorAlertMessage, setErrorAlertMessage] = useState('');
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // 🔹 Get AgentId from AsyncStorage
    // useEffect(() => {
    //     const fetchAgentId = async () => {
    //         if (!agentIdFromOtp) {
    //             const id = await AsyncStorage.getItem('agentId');
    //             if (id) setAgentId(parseInt(id));
    //         } else {
    //             setAgentId(agentIdFromOtp)
    //         }
    //     };
    //     fetchAgentId();
    // }, []);

    const onResetPassword = async () => {
        // if (!agentIdFromOtp) {
        //     setErrorAlertMessage('Agent not logged in');
        //     setShowErrorAlert(true);
        //     return;
        // }

        if (!newPassword || !confirmPassword) {
            setErrorAlertMessage('Please fill all fields');
            setShowErrorAlert(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorAlertMessage('New password and confirm password do not match');
            setShowErrorAlert(true);
            return;
        }

        try {
            setLoading(true);

            // const payload = {
            //     AgentId: agentId,
            //     OldPassword: oldPassword,
            //     NewPassword: newPassword,
            // };

            // const response = await axios.post(
            //     'http://dev.buyerzkart.com/api/api/v2/Auth/ChangePassword',
            //     payload
            // );

            const response = await resetPwd(resetToken, confirmPassword);

            const res = response.data;
            // console.log('resetres', res)
            if (res?.success) {
                // Alert.alert('Success', 'Password changed successfully', [
                //     { text: 'OK', onPress: () => navigation.goBack() },
                // ]);
                setShowSuccessAlert(true)
            } else {
                setErrorAlertMessage(res?.message || 'Password change failed');
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setErrorAlertMessage('Something went wrong. Please try again.');
            setShowErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoaderComponent />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color={AppColors.primaryColor} />
            </TouchableOpacity>
            <AlertComponent
                visible={showErrorAlert}
                message={errorAlertMessage}
                okClick={() => setShowErrorAlert(false)}
            />
            <AlertComponent
                visible={showSuccessAlert}
                message={"Password changed successfully"}
                okClick={() => {
                    logout();
                    AsyncStorage.clear()
                    navigation.replace("Login")
                }}
                showTitle={true}
                title={"Success"}
            />
            <Text style={styles.title}>Reset Passwossrd</Text>

            {/* <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Old Password"
                    secureTextEntry={!oldPwdVisible}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholderTextColor={AppColors.gray}
                />
                <TouchableOpacity onPress={() => setOldPwdVisible(!oldPwdVisible)}>
                    <MaterialIcons
                        name={oldPwdVisible ? 'visibility' : 'visibility-off'}
                        size={22}
                        color={AppColors.darkBlue}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View> */}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    secureTextEntry={!newPwdVisible}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholderTextColor={AppColors.gray}
                />
                <TouchableOpacity onPress={() => setNewPwdVisible(!newPwdVisible)}>
                    <MaterialIcons
                        name={newPwdVisible ? 'visibility' : 'visibility-off'}
                        size={22}
                        color={AppColors.darkBlue}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    secureTextEntry={!confirmPwdVisible}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor={AppColors.gray}
                />
                <TouchableOpacity onPress={() => setConfirmPwdVisible(!confirmPwdVisible)}>
                    <MaterialIcons
                        name={confirmPwdVisible ? 'visibility' : 'visibility-off'}
                        size={22}
                        color={AppColors.darkBlue}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={onResetPassword}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButtonView}>
                <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity> */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: width * 0.1,
        backgroundColor: AppColors.primaryColor,
    },
    title: {
        fontSize: 17,
        textAlign: 'center',
        color: AppColors.whiteColor,
        fontFamily: Fonts.OpenSansBold,
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: AppColors.darkBlue,
        borderWidth: 2,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: AppColors.whiteColor,
    },
    input: {
        flex: 1,
        height: 50,
        paddingLeft: 10,
        fontSize: 14,
        color: AppColors.black,
        fontFamily: Fonts.OpenSansRegular,
    },
    icon: {
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: AppColors.darkBlue,
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: AppColors.whiteColor,
        fontSize: 15,
        fontFamily: Fonts.OpenSansBold,
    },
    backButtonView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    backButtonText: {
        color: AppColors.whiteColor,
        fontSize: 13,
        fontFamily: Fonts.OpenSansBold,
    },
    backButton: {
        backgroundColor: AppColors.whiteColor,
        padding: 8,
        borderRadius: 20,
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 10,
        elevation: 3,
    },

});

export default ResetPwdScreen;
