// LoginScreen.js
import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    Vibration,
    Alert,
} from 'react-native';
import { AppColors } from '../constants/Colors';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import AlertComponent from '../components/AlertComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoaderComponent from '../components/LoaderComponent';
// import { ItemContext } from '../context/ItemContext';
import { Fonts } from '../constants/Fonts';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import { fetchAgentDetails } from '../redux/slices/agentSlice';
import { forgotPwd, login, sendOtp } from '../services/api/api';

const { width } = Dimensions.get('window');

const ForgotPwdScreen = props => {
    const [mobileNo, setMobileNo] = useState('');
    useState(false);
    const [loading, setLoading] = useState(false);
    const [showMobileNoEmptyAlert, setShowMobileNoEmptyAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showInvalidAlert, setShownvalidAlert] = useState(false);
    const [otpurlkey, setOtpurlkey] = useState(null);
    const [otpType, setOtpType] = useState(null)

    // const { phoneNumber, setPhoneNumber } = useContext(ItemContext);

    const dispatch = useDispatch()

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const response = await sendOtp(mobileNo);
            // console.log('resFor', response.data)
            const res = response.data;
            if (res?.success) {
                setOtpurlkey(res?.Data)
                // setOtpType
                setShowSuccessAlert(true)
            } else {
                setShownvalidAlert(true)
            }
        } catch (error) {
            setShownvalidAlert(true)
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoaderComponent />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color={AppColors.primaryColor} />
            </TouchableOpacity>

            <AlertComponent
                visible={showMobileNoEmptyAlert}
                message={'Please enter Mobile number'}
                okClick={() => setShowMobileNoEmptyAlert(false)}
            />

            <AlertComponent
                visible={showSuccessAlert}
                message={'OTP Send successfully'}
                okClick={() => {
                    setShowSuccessAlert(false)
                    props.navigation.navigate("OtpVerify", {
                        mobileNo,
                        otpurlkey
                    })
                }}
            />

            <AlertComponent
                visible={showInvalidAlert}
                message={'Invalid mobile number'}
                okClick={() => setShownvalidAlert(false)}
            />

            <Text style={styles.title}>Forgot Password!</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Mobile Number"
                    keyboardType="numeric"
                    value={mobileNo}
                    onChangeText={setMobileNo}
                    placeholderTextColor={AppColors.gray}
                />
                <Entypo
                    name="mobile"
                    size={24}
                    color={AppColors.darkBlue}
                    style={styles.icon}
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    if (mobileNo) {
                        handleSendOtp();
                    }
                    else {
                        setShowMobileNoEmptyAlert(true)
                    }
                }}>
                <Text style={styles.buttonText}>Send OTP</Text>
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

export default ForgotPwdScreen;
