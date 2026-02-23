import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute } from "@react-navigation/native";
import { fetchAttendance } from "../services/api/api";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";

export default function AttendanceHistoryScreen(props) {
    const route = useRoute();
    const { agentId } = route.params;

    const [attendanceList, setAttendanceList] = useState([]);
    const [overallAttendance, setOverallAttendance] = useState([]);
    const [loading, setLoading] = useState(false);

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(today);

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        getAttendance();
    }, [startDate, endDate]);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("en-GB", { month: "short" }); // "Oct"
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const formatDateTwo = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`; // returns 2025-10-13
    };

    const getAttendance = async () => {
        try {
            setLoading(true);

            const start = formatDateTwo(startDate);
            const end = formatDateTwo(endDate);

            const res = await fetchAttendance(start, end);
            // console.log('res.data.data', res.data.data)
            if (res.data.success) {
                setAttendanceList(res.data.data.dayWise);
                setOverallAttendance(res.data.data.overall)
            } else {
                Alert.alert("Error", "Failed to fetch attendance records.");
            }
        } catch (err) {
            console.error("Fetch Attendance Error:", err);
            Alert.alert("Error", "Something went wrong while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartDateChange = (event, selectedDate) => {
        setShowStartPicker(false);
        if (selectedDate) {
            const diffMonths =
                (endDate.getFullYear() - selectedDate.getFullYear()) * 12 +
                (endDate.getMonth() - selectedDate.getMonth());
            if (diffMonths > 3) {
                Alert.alert("Limit Exceeded", "You can only select up to 3 months range.");
                return;
            }
            setStartDate(selectedDate);
        }
    };

    const handleEndDateChange = (event, selectedDate) => {
        setShowEndPicker(false);
        if (selectedDate) {
            const diffMonths =
                (selectedDate.getFullYear() - startDate.getFullYear()) * 12 +
                (selectedDate.getMonth() - startDate.getMonth());
            if (diffMonths > 3) {
                Alert.alert("Limit Exceeded", "You can only select up to 3 months range.");
                return;
            }
            setEndDate(selectedDate);
        }
    };

    const convert24To12 = (time24) => {
        if (!time24) return null;

        let [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12; // convert 0 -> 12
        return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    const getTimeHHMM = (dateTime) => {
        if (!dateTime) return null;

        const time24 = dateTime.slice(11, 16);
        return convert24To12(time24);
    };

    const renderItem = ({ item }) => {
        const dateObj = new Date(item.workDate);
        const dateStr = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });


        // const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return (
            <View style={styles.row}>
                <Text style={styles.cell}>{dateStr}</Text>
                <Text style={styles.cell}>{getTimeHHMM(item.inTime)}</Text>
                <Text style={styles.cell}>{getTimeHHMM(item.outTime)}</Text>
                {/* <Text
                    style={[
                        styles.cell,
                        item.status === "PUNCH IN"
                            ? styles.punchIn
                            : item.status === "PUNCH OUT"
                                ? styles.punchOut
                                : styles.other,
                    ]}
                >
                    {item.status}
                </Text> */}
            </View>
        );
    };

    const renderDatePicker = (type) => {
        const value = type === "start" ? startDate : endDate;
        const onChange = type === "start" ? handleStartDateChange : handleEndDateChange;

        return (
            <DateTimePicker
                value={value}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChange}
                maximumDate={today}
            />
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => props.navigation.goBack()}
            >
                <Entypo name="arrow-left" size={24} color={AppColors.whiteColor} />
            </TouchableOpacity>
            {/* Header */}
            <Text style={styles.title}>Attendance History</Text>

            {/* Date Pickers */}
            <View style={styles.dateContainer}>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                >
                    <Text style={styles.dateText}>Start: {formatDate(startDate)}</Text>
                    <Feather name="arrow-down" size={18} color={AppColors.whiteColor} style={{
                        marginLeft: 3
                    }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                >
                    <Text style={styles.dateText}>End: {formatDate(endDate)}</Text>
                    <Feather name="arrow-down" size={18} color={AppColors.whiteColor} style={{
                        marginLeft: 3
                    }} />
                </TouchableOpacity>
            </View>

            {/* <View style={{
                flexDirection: 'row',
                marginBottom: 5
            }}> */}
                <View style={{
                    alignItems: 'center',
                    backgroundColor: AppColors.primaryColor,
                    borderRadius: 10,
                    width: 210,
                    justifyContent: 'center',
                    height: 34,
                    flexDirection: 'row',
                    alignSelf: 'center',
                    marginBottom: 5
                    // padding: 10
                }}>
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontFamily: Fonts.OpenSansRegular,
                        fontSize: 14
                    }}>Total hours worked:</Text>
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontFamily: Fonts.OpenSansSemiBold,
                        fontSize: 14
                    }}>{overallAttendance.overallHours} hrs</Text>
                </View>
                {/* <View style={{
                    alignItems: 'center',
                    backgroundColor: AppColors.primaryColor,
                    borderRadius: 10,
                    width: 150,
                    justifyContent: 'center',
                    height: 45
                }}>
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontFamily: Fonts.OpenSansRegular,
                        fontSize: 13
                    }}>Total minutes worked:</Text>
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontFamily: Fonts.OpenSansSemiBold,
                        fontSize: 13
                    }}>{overallAttendance.overallMinutes} mins</Text>
                </View> */}
            {/* </View> */}


            {/* {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                    maximumDate={today}
                />
            )} */}

            {showStartPicker && renderDatePicker("start")}
            {showEndPicker && renderDatePicker("end")}

            {/* Loader */}
            {loading ? (
                <ActivityIndicator size="large" color={AppColors.primaryColor} style={{ marginTop: 40 }} />
            ) : (
                <>
                    {/* Table Header */}
                    <View style={[styles.row, styles.headerRow]}>
                        <Text style={[styles.cell, styles.headerText]}>Date</Text>
                        <Text style={[styles.cell, styles.headerText]}>In Time</Text>
                        <Text style={[styles.cell, styles.headerText]}>Out Time</Text>
                    </View>

                    {/* Table Data */}
                    <FlatList
                        data={attendanceList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No attendance records found.</Text>
                        }
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 16,
    },
    title: {
        fontFamily: Fonts.OpenSansSemiBold,
        fontSize: 18,
        color: AppColors.whiteColor,
        marginBottom: 16,
        textAlign: "center",
    },
    dateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        marginTop: 15
    },
    dateButton: {
        backgroundColor: AppColors.primaryColor,
        padding: 10,
        borderRadius: 8,
        flexDirection: "row"
    },
    dateText: {
        color: AppColors.whiteColor,
        fontFamily: Fonts.OpenSansRegular,
    },
    headerRow: {
        borderBottomWidth: 1,
        borderBottomColor: AppColors.whiteColor,
        paddingBottom: 6,
        marginBottom: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomColor: "#333",
        borderBottomWidth: 0.5,
    },
    cell: {
        flex: 1,
        textAlign: "center",
        color: AppColors.whiteColor,
        fontFamily: Fonts.OpenSansRegular,
        fontSize: 13,
    },
    headerText: {
        fontFamily: Fonts.OpenSansSemiBold,
        color: AppColors.whiteColor,
    },
    punchIn: { color: "limegreen" },
    punchOut: { color: "#ff4d4d" },
    other: { color: "#ffd700" },
    emptyText: {
        textAlign: "center",
        color: "#aaa",
        marginTop: 40,
        fontFamily: Fonts.OpenSansRegular,
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 16,
        zIndex: 10,
        padding: 6,
        backgroundColor: AppColors.primaryColor,
        borderRadius: 8,
    },
});
