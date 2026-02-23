import { View, Text, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AppColors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LoaderComponent from '../components/LoaderComponent';
import { resendOtp, verifyOtp } from '../services/api/api';
import AlertComponent from '../components/AlertComponent';

const { width } = Dimensions.get('window');

const OtpVerifyScreen = (props) => {
    const { mobileNo, otpType } = props.route.params;
    const [otp, setOtp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showOtpEmptyAlert, setShowOtpEmptyAlert] = useState(false)
    const [showSuccessAlert, setShowSuccessAlert] = useState(false)
    const [successAlertMessage, setSuccessAlertMessage] = useState('')
    const [showFailAlert, setShowFailAlert] = useState(false)
    const [showResendOtpSuccessAlert, setShowResendOtpSuccessAlert] = useState(false)
    const [resendOtpSuccessMessage, setResendOtpSuccessMessage] = useState('')
    const [showResendOtpFailAlert, setShowResendOtpFailAlert] = useState(false)
    const [resendOtpFailMessage, setResendOtpFailMessage] = useState('')
    const [resendTimer, setResendTimer] = useState(60);
    const [agentId, setAgentId] = useState(null);
    const [resetToken, setResetToken] = useState(null)

    const handleVerifyOtp = async () => {

        setLoading(true);
        try {
            // console.log(mobileNo)
            const response = await verifyOtp(mobileNo, otp, otpType);
            const res = response.data;

            console.log('verifyotpres', res)

            if (res?.success) {
                // setAgentId(res.AgentId)
                setResetToken(res?.data?.resetToken)
                setSuccessAlertMessage(res?.message)
                setShowSuccessAlert(true)
            } else {
                setShowFailAlert(true)
            }
        } catch (error) {
            setShowFailAlert(true)
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        try {
            const response = await resendOtp(mobileNo);
            if (response?.data?.Message) {
                // Alert.alert("Success", response.Message);
                setResendOtpSuccessMessage(response?.data?.Message)
                setShowResendOtpSuccessAlert(true)
                setResendTimer(60); // disable resend for 30 seconds
            } else {
                Alert.alert("Failed", "Could not resend OTP");
            }
        } catch (error) {
            // console.log('error', error)
            Alert.alert("Error", "Something went wrong while resending OTP");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval = null;
        if (resendTimer > 0) {
            interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    if (loading) {
        return <LoaderComponent />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color={AppColors.primaryColor} />
            </TouchableOpacity>

            <AlertComponent
                visible={showSuccessAlert}
                message={successAlertMessage}
                okClick={() => {
                    setShowSuccessAlert(false)
                    props.navigation.navigate("ResetPwd", {
                        resetToken
                    })
                }}
            />

            <AlertComponent
                visible={showOtpEmptyAlert}
                message={'Please enter OTP'}
                okClick={() => setShowOtpEmptyAlert(false)}
            />

            <AlertComponent
                visible={showFailAlert}
                message={'OTP verification failed'}
                okClick={() => setShowFailAlert(false)}
            />

            <AlertComponent
                visible={showResendOtpSuccessAlert}
                message={resendOtpSuccessMessage}
                okClick={() => setShowResendOtpSuccessAlert(false)}
            />

            <AlertComponent
                visible={showResendOtpFailAlert}
                message={resendOtpFailMessage}
                okClick={() => setShowResendOtpFailAlert(false)}
            />

            <Text style={styles.title}>Enter OTP</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="OTP"
                    keyboardType="numeric"
                    value={otp}
                    onChangeText={setOtp}
                    placeholderTextColor={AppColors.gray}
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    if (otp) {
                        handleVerifyOtp()
                    } else {
                        setShowOtpEmptyAlert(true)
                    }
                }}>
                <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity
                disabled={resendTimer > 0}
                style={[
                    styles.button,
                    { backgroundColor: resendTimer > 0 ? AppColors.gray : AppColors.whiteColor, marginTop: 15 },
                ]}
                onPress={handleResendOtp}
            >
                <Text style={[styles.buttonText, { color: AppColors.darkBlue }]}>
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </Text>
            </TouchableOpacity>

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
        // fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: AppColors.whiteColor,
        fontFamily: Fonts.OpenSansBold,
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
        // fontWeight: 'bold',
        fontFamily: Fonts.OpenSansBold,
    },
    forgotPwdButtonView: {
        justifyContent: "center",
        alignItems: "flex-end",
        marginTop: 10,
    },
    forgotPwdButtonText: {
        color: AppColors.whiteColor,
        fontSize: 13,
        // fontWeight: 'bold',
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

export default OtpVerifyScreen