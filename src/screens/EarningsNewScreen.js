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
import { useRoute, useNavigation } from "@react-navigation/native";
import { fetchEarnings } from "../services/api/api";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default function EarningsNewScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { agentId } = route.params;

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(today);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [loading, setLoading] = useState(false);
    const [earningsList, setEarningsList] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

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

    useEffect(() => {
        getEarnings();
    }, [startDate, endDate]);

    const getEarnings = async () => {
        try {
            setLoading(true);
            // console.log("1111")
            const start = formatDateTwo(startDate);
            const end = formatDateTwo(endDate);
            // console.log("sta", start)
            // console.log("end", end)
            const res = await fetchEarnings(start, end);
            // console.log('res', res.data.data)
            if (res.data.success) {
                setEarningsList(res.data.data.items);
                setTotalEarnings(res.data.data.totals.totalEarnings || 0);
                setTotalPaid(res.data.data.totals.totalPaid || 0);
                setTotalPending(res.data.data.totals.totalPending || 0);
            } else {
                Alert.alert("Error", "Failed to fetch earnings.");
            }
        } catch (err) {
            console.error("Fetch Earnings Error:", err);
            Alert.alert("Error", "Something went wrong while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    // const handleStartDateChange = (event, selectedDate) => {
    //     setShowStartPicker(false);
    //     if (selectedDate) setStartDate(selectedDate);
    // };

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


    // const handleEndDateChange = (event, selectedDate) => {
    //     setShowEndPicker(false);
    //     if (selectedDate) setEndDate(selectedDate);
    // };


    const renderItem = ({ item }) => {
        const dateObj = new Date(item.createdAt);
        const dateStr = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        return (
            <View style={styles.row}>
                <Text style={styles.cell}>{item.orderNumber}</Text>
                <Text style={styles.cell}>{dateStr}</Text>
                <Text style={[styles.cell, { flex: 1 }]}>{item.amount.toFixed(2)}</Text>
                <Text style={styles.cell}>{item.remarks}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Entypo name="arrow-left" size={24} color={AppColors.whiteColor} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Earnings</Text>

            {/* Total Earnings Badge */}

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

            <View style={{
                flexDirection: 'row',
                justifyContent: "space-evenly",
                marginBottom: 5
            }}>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>Earnings:</Text>
                    <Text style={{
                        fontFamily: Fonts.OpenSansSemiBold,
                        fontSize: 13,
                        color: AppColors.whiteColor
                    }}>₹{totalEarnings.toFixed(2)}</Text>
                </View>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>Paid:</Text>
                    <Text style={{
                        fontFamily: Fonts.OpenSansSemiBold,
                        fontSize: 13,
                        color: AppColors.whiteColor
                    }}>₹{totalPaid.toFixed(2)}</Text>
                </View>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>Pending:</Text>
                    <Text style={{
                        fontFamily: Fonts.OpenSansSemiBold,
                        fontSize: 13,
                        color: AppColors.whiteColor
                    }}>₹{totalPending.toFixed(2)}</Text>
                </View>
            </View>
            {showStartPicker && (
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
            )}

            {/* Loader */}
            {loading ? (
                <ActivityIndicator size="large" color={AppColors.primaryColor} style={{ marginTop: 40 }} />
            ) : (
                <>
                    {/* Table Header */}
                    <View style={[styles.row, styles.headerRow]}>
                        <Text style={[styles.cell, styles.headerText]}>Order Number</Text>
                        <Text style={[styles.cell, styles.headerText]}>Date</Text>
                        <Text style={[styles.cell, styles.headerText, { flex: 1 }]}>Amount</Text>
                        <Text style={[styles.cell, styles.headerText]}>Remarks</Text>
                    </View>

                    {/* Table Data */}
                    <FlatList
                        data={earningsList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No earnings records found.</Text>
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
    backButton: {
        position: "absolute",
        top: 20,
        left: 16,
        zIndex: 10,
        padding: 6,
        backgroundColor: AppColors.primaryColor,
        borderRadius: 8,
    },
    badgeContainer: {
        backgroundColor: AppColors.primaryColor,
        borderRadius: 10,
        // alignSelf: "center",
        // marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: 73,
        height: 52
    },
    badgeText: {
        color: AppColors.whiteColor,
        fontFamily: Fonts.OpenSansRegular,
        fontSize: 13,
        textAlign: 'center'
    },
    dateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        marginTop: 10
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
        flex: 2,
        textAlign: "center",
        color: AppColors.whiteColor,
        fontFamily: Fonts.OpenSansRegular,
        fontSize: 11,
    },
    headerText: {
        fontFamily: Fonts.OpenSansSemiBold,
        color: AppColors.whiteColor,
        fontSize: 11
    },
    emptyText: {
        textAlign: "center",
        color: "#aaa",
        marginTop: 40,
        fontFamily: Fonts.OpenSansRegular,
    },
});
