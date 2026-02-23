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
import { login } from '../services/api/api';
import { OneSignal } from 'react-native-onesignal';

const { width } = Dimensions.get('window');

const LoginScreen = props => {
    const [mobileNo, setMobileNo] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [showPasswordIncorrectAlert, setShowPasswordIncorrectAlert] =
        useState(false);
    const [showUserNotExistAlert, setShowUserNotExistAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showMobileNoEmptyAlert, setShowMobileNoEmptyAlert] = useState(false);
    const [showPwdEmptyAlert, setShowPwdEmptyAlert] = useState(false);
    const [showLoginFailedAlert, setShowLoginFailedAlert] = useState(false);
    const [showMobnoAndPwdEmptyAlert, setShowMobnoAndPwdEmptyAlert] =
        useState(false);

    // const { phoneNumber, setPhoneNumber } = useContext(ItemContext);

    const dispatch = useDispatch()

    // const loginWithPhoneAndPassword = async () => {
    //     setLoading(true);
    //     try {
    //         const usersQuerySnapshot = await firestore()
    //             .collection('deliveryAgents')
    //             .where('mobile', '==', mobileNo)
    //             .get();

    //         if (!usersQuerySnapshot.empty) {
    //             const userDoc = usersQuerySnapshot.docs[0]; // Assuming mobileNo is unique
    //             const userData = userDoc.data();

    //             if (userData.password === password) {
    //                 await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
    //                 await AsyncStorage.setItem('id', userData.id);
    //                 await AsyncStorage.setItem('storeId', userData.storeId);
    //                 // setPhoneNumber(mobileNo);
    //                 // dispatch(fetchAgentDetails())
    //                 props.navigation.replace('Home');
    //             } else {
    //                 setShowPasswordIncorrectAlert(true);
    //             }
    //         } else {
    //             setShowUserNotExistAlert(true);
    //         }
    //     } catch (error) {
    //         console.error('Error logging in:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const loginWithPhoneAndPassword = async () => {
    //     setLoading(true);
    //     try {
    //         // const usersQuerySnapshot = await firestore()
    //         //     .collection('deliveryAgents')
    //         //     .where('mobile', '==', mobileNo)
    //         //     .get();

    //         const res = await login(mobileNo, password);
    //         // console.log("res", res.data)
    //         if (res.data?.Token) {
    //             await AsyncStorage.setItem("authToken", res.data.Token);
    //             await AsyncStorage.setItem("refreshToken", res.data.RefreshToken);
    //             await AsyncStorage.setItem("agentId", res.data.AgentId.toString());
    //             await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
    //             props.navigation.replace('Home');
    //         } else {
    //             Alert.alert("Login Failed", res.data?.Message || "Unknown error");
    //         }
    //         // console.log("res", res.data)
    //         // if (!usersQuerySnapshot.empty) {
    //         //     const userDoc = usersQuerySnapshot.docs[0]; // Assuming mobileNo is unique
    //         //     const userData = userDoc.data();

    //         //     if (userData.password === password) {
    //         //         await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
    //         //         await AsyncStorage.setItem('id', userData.id);
    //         //         await AsyncStorage.setItem('storeId', userData.storeId);
    //         //         // setPhoneNumber(mobileNo);
    //         //         // dispatch(fetchAgentDetails())
    //         //         props.navigation.replace('Home');
    //         //     } else {
    //         //         setShowPasswordIncorrectAlert(true);
    //         //     }
    //         // } else {
    //         //     setShowUserNotExistAlert(true);
    //         // }
    //     } catch (error) {
    //         console.error('Error logging in:', error);
    //         setShowLoginFailedAlert(true)
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const loginWithPhoneAndPassword = async () => {
        setLoading(true);
        try {
            const res = await login(mobileNo, password);
            // console.log('resssss', res.data.data)

            if (res.data?.success) {
                const externalId = res.data.data.deliveryAgentId.toString();
                const onesignalId = `agent_${externalId}`;
                // console.log('externalIdDDDD', externalId)
                // console.log("📌 Final externalId to set:", onesignalId);

                // VERY IMPORTANT – RESET OLD USER
                await OneSignal.logout();

                // Now login with new external ID
                OneSignal.login(onesignalId);

                await AsyncStorage.setItem("authToken", res.data.data.accessToken);
                await AsyncStorage.setItem("refreshToken", res.data.data.refreshToken);
                await AsyncStorage.setItem("agentId", externalId);
                await AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));

                props.navigation.replace('Home');
            } else {
                Alert.alert("Login Failed", res.data?.message || "Unknown error");
            }

        } catch (error) {
            console.error('Error logging in:', error);
            setShowLoginFailedAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const onClickingForgotPwd = () => {
        props.navigation.navigate("ForgotPwd")
    }

    if (loading) {
        return <LoaderComponent />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <AlertComponent
                visible={showLoginFailedAlert}
                message={'Login Failed'}
                okClick={() => setShowLoginFailedAlert(false)}
            />
            <AlertComponent
                visible={showPasswordIncorrectAlert}
                message={'Incorrect password'}
                okClick={() => setShowPasswordIncorrectAlert(false)}
            />
            <AlertComponent
                visible={showUserNotExistAlert}
                message={'User does not exist'}
                okClick={() => setShowUserNotExistAlert(false)}
            />
            <AlertComponent
                visible={showMobileNoEmptyAlert}
                message={'Please enter Mobile number'}
                okClick={() => setShowMobileNoEmptyAlert(false)}
            />
            <AlertComponent
                visible={showPwdEmptyAlert}
                message={'Please enter Password'}
                okClick={() => setShowPwdEmptyAlert(false)}
            />
            <AlertComponent
                visible={showMobnoAndPwdEmptyAlert}
                message={'Please enter Mobile number and Password'}
                okClick={() => setShowMobnoAndPwdEmptyAlert(false)}
            />
            <Text style={styles.title}>B-Delivery</Text>

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

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={AppColors.gray}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <MaterialIcons
                        name={passwordVisible ? 'visibility' : 'visibility-off'}
                        size={24}
                        color={AppColors.darkBlue}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    if (mobileNo && password) {
                        loginWithPhoneAndPassword();
                    } else if (!mobileNo && password) {
                        setShowMobileNoEmptyAlert(true);
                    } else if (!password && mobileNo) {
                        setShowPwdEmptyAlert(true);
                    } else if (!mobileNo && !password) {
                        setShowMobnoAndPwdEmptyAlert(true);
                    }
                }}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClickingForgotPwd} style={styles.forgotPwdButtonView}>
                <Text style={styles.forgotPwdButtonText}>Forgot Password</Text>
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
    }
});

export default LoginScreen;
