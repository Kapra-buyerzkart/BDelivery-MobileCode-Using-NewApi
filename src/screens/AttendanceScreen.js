import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { AppColors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import LoaderComponent from '../components/LoaderComponent';
import AlertComponent from '../components/AlertComponent';
import { fetchAttendance, markAttendance } from '../services/api/api';

export default function AttendanceScreen() {
    const route = useRoute();
    const { agentId } = route.params;
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [showLocationErrorAlert, setShowLocationErrorAlert] = useState(false);
    const [punchType, setPunchType] = useState('punchIn'); // Default
    const navigation = useNavigation();
    const store = useSelector((state) => state.store);

    // ✅ Get today's date range (startDate = today, endDate = tomorrow)
    const getDateRange = () => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const format = (d) => d.toISOString().split('T')[0];
        return {
            startDate: format(today),
            endDate: format(today),
        };
    };

    // ✅ Fetch today's last attendance
    useEffect(() => {
        const loadPunchStatus = async () => {
            setLoading(true)
            try {
                const { startDate, endDate } = getDateRange();
                const res = await fetchAttendance(startDate, endDate);
                const records = res?.data?.data?.dayWise || [];

                if (records.length > 0) {
                    const lastRecord = records[records.length - 1];
                    if (lastRecord.outTime === null) {
                        setPunchType('punchOut');
                    } else {
                        setPunchType('punchIn');
                    }
                } else {
                    setPunchType('punchIn');
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setLoading(false)
            }
        };

        loadPunchStatus();
    }, []);

    // ✅ Request location permission
    useEffect(() => {
        (async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
            } else {
                const status = await Geolocation.requestAuthorization('whenInUse');
                setHasPermission(status === 'granted');
            }
        })();
    }, []);

    // ✅ Fetch current location
    useEffect(() => {
        if (!hasPermission) return;

        setLocationLoading(true);
        Geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLatitude(latitude);
                setLongitude(longitude);
                setLocationLoading(false);
            },
            (err) => {
                console.log('Location Error:', err);
                setShowLocationErrorAlert(true);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }, [hasPermission]);

    // ✅ Mark Attendance
    const takeAttendance = async () => {
        if (!hasPermission || !latitude || !longitude) {
            Alert.alert('Error', 'Location not available.');
            return;
        }

        setLoading(true);
        try {
            const status = punchType === 'punchIn' ? 'IN' : 'OUT';
            const res = await markAttendance(status, latitude, longitude);

            if (res.data.success) {
                setShowSuccessAlert(true);
                // ✅ Toggle for next time
                setPunchType(punchType === 'punchIn' ? 'punchOut' : 'punchIn');
            } else {
                setShowErrorAlert(true);
            }
        } catch (err) {
            console.error('Mark attendance failed:', err);
            setShowErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

    if (!hasPermission || loading) return <LoaderComponent />;

    return (
        <View style={styles.container}>
            {/* ✅ Alerts */}
            <AlertComponent
                visible={showSuccessAlert}
                showTitle={true}
                title={'Success'}
                message={'Attendance marked successfully!'}
                okClick={() => setShowSuccessAlert(false)}
            />
            <AlertComponent
                visible={showLocationErrorAlert}
                showTitle={true}
                title={'Location Error'}
                message={'Failed to get location. Please enable GPS.'}
                okClick={() => setShowLocationErrorAlert(false)}
            />
            <AlertComponent
                visible={showErrorAlert}
                showTitle={true}
                title={'Error'}
                message={'Something went wrong during attendance.'}
                okClick={() => setShowErrorAlert(false)}
            />

            {/* ✅ Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color={AppColors.whiteColor} />
            </TouchableOpacity>

            {/* ✅ Main Content */}
            <View style={styles.content}>
                {locationLoading ? (
                    <>
                        <ActivityIndicator color={AppColors.whiteColor} size="large" />
                        <Text style={styles.infoText}>Fetching location...</Text>
                    </>
                ) : (
                    <>
                        <Entypo
                            name="location"
                            size={30}
                            color={AppColors.red}
                            style={{ marginBottom: 15 }}
                        />
                        <Text style={styles.locationText}>
                            Latitude: {latitude?.toFixed(6)}{'\n'}Longitude: {longitude?.toFixed(6)}
                        </Text>

                        <Text style={styles.infoText}>
                            {punchType === 'punchIn' ? 'Ready to Punch In?' : 'Ready to Punch Out?'}
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={takeAttendance}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={AppColors.whiteColor} />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {punchType === 'punchIn' ? 'Punch In' : 'Punch Out'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: AppColors.appBackgroundColor },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        color: AppColors.black,
        fontSize: 16,
        fontFamily: Fonts.OpenSansSemiBold,
        marginTop: 30,
        textAlign: 'center',
    },
    locationText: {
        color: AppColors.black,
        fontSize: 14,
        fontFamily: Fonts.OpenSansRegular,
        textAlign: 'center',
    },
    button: {
        backgroundColor: AppColors.primaryColor,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginTop: 40,
    },
    buttonText: {
        color: AppColors.whiteColor,
        fontSize: 14,
        fontFamily: Fonts.OpenSansSemiBold,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        backgroundColor: AppColors.primaryColor,
        borderRadius: 10,
        padding: 6,
    },
});
