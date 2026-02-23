import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Linking,
    ScrollView,
    Alert,
    PermissionsAndroid,
    Platform,
    Modal
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // 👈 Added
import { AppColors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { completeOrderDelivery, fetchOrderDetails } from "../services/api/api";
import LoaderComponent from "../components/LoaderComponent";
import moment from "moment";
import Geolocation from "@react-native-community/geolocation";
import qs from 'qs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertComponent from "../components/AlertComponent";

const OrderDeliveredDetailsScreen = ({ route, navigation }) => {
    const { orderId, tab } = route.params;
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderDetailsLoading, setOrderDetailsLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [orderCompleteConfirmModdalVisible, setOrderCompleteConfirmModdalVisible] = useState(false)
    const [showOrderDeliveredSuccessAlert, setShowOrderDeliveredSuccessAlert] = useState(false);
    const [orderDeliveredSuccessMessage, setOrderDeliveredSuccessMessage] = useState('')


    useEffect(() => {
        const getOrderDetails = async () => {
            // console.log('orderId', orderId)
            try {
                const response = await fetchOrderDetails(orderId);
                // console.log("Order details:", response.data);
                setOrderDetails(response.data.data);
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setOrderDetailsLoading(false);
            }
        };

        getOrderDetails();
    }, [orderId]);


    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                if (Platform.OS === 'android') {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );

                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        getLocation();
                    } else {
                        console.warn('Location permission denied');
                        setLoading(false);
                    }
                } else {
                    getLocation();
                }
            } catch (error) {
                console.error('Permission request error:', error);
                setLoading(false);
            }
        };

        const getLocation = () => {
            Geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLoading(false);
                },
                (error) => {
                    console.error('Location error:', error);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 30000,
                    maximumAge: 10000,
                }
            );
        };

        requestLocationPermission();
    }, []);


    const handleNavigate = () => {
        if (orderDetails?.ShippingAddress) {
            // const encodedAddress = encodeURIComponent(orderDetails.customerAddress);
            // const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
            const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${orderDetails?.OrderDetails?.latitude},${orderDetails?.OrderDetails?.longitude}`
            Linking.openURL(url);
        } else {
            Alert.alert("Address not available");
        }
    };

    const handleDeliverOrder = () => {
        setOrderCompleteConfirmModdalVisible(true)
    };

    const handleCallKapra = () => {
        Linking.openURL(`tel:9605913522`); // Replace with real number
    };

    if (loading || orderDetailsLoading) return <LoaderComponent />;

    // if (!orderDetails)
    //     return (
    //         <View style={styles.centered}>
    //             <Text style={styles.noDataText}>No order details found</Text>
    //         </View>
    //     );


    const customerName = [
        orderDetails?.ShippingAddress?.firstName,
        orderDetails?.ShippingAddress?.middleName,
        orderDetails?.ShippingAddress?.lastName
    ]
        .filter(namePart => namePart) // remove null/undefined/empty
        .join(" "); // join with space

    const address = [
        orderDetails?.customer?.addLine1,
        orderDetails?.customer?.addLine2,
        orderDetails?.customer?.pincodeAreaName,
        orderDetails?.customer?.district,
        orderDetails?.customer?.state,
        orderDetails?.customer?.pincode
        // orderDetails?.ShippingAddress?.pincode,
    ]
        .filter(addressPart => addressPart) // remove null/undefined/empty
        .join(", "); // join with space

    const handleYesPress = async () => {
        setLoading(true)
        setOrderCompleteConfirmModdalVisible(false)
        try {
            const agentId = await AsyncStorage.getItem('agentId');
            const data = qs.stringify({
                orderId,
                agentId,
                status: "Order Delivered",
                signImage: null,
                deliveryNote: "Delivered by agent",
                deliveryFreebies: false,
            });

            const response = await completeOrderDelivery(
                orderId,
                agentId,
                "Order Delivered",
                null,
                "Delivered by agent",
                false
            );
            // setOrderDeliveredSuccessMessage(response.data.Message)
            if (response.status === 200) {
                setShowOrderDeliveredSuccessAlert(true)
            }
            // console.log("resDeeee", response)
            // Alert.alert("Success", response.data.Message);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to update delivery status");
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <Modal
                transparent={true}
                visible={orderCompleteConfirmModdalVisible}
                animationType="fade"
                onRequestClose={() => setOrderCompleteConfirmModdalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                            Are you sure the order has been delivered to the customer?
                        </Text>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: AppColors.green, marginRight: 5 }]}
                                onPress={handleYesPress} // your API call
                            >
                                <Text style={styles.okButtonText}>Yes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: AppColors.red, marginLeft: 5 }]}
                                onPress={() => setOrderCompleteConfirmModdalVisible(false)}
                            >
                                <Text style={styles.okButtonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <AlertComponent
                visible={showOrderDeliveredSuccessAlert}
                showTitle={false}
                message={"Order Delivered Successfully"}
                okClick={() => {
                    setShowOrderDeliveredSuccessAlert(false)
                    navigation.navigate("Home")
                }}
            />
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={22}
                        color={AppColors.primaryColor}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { height: 0 }]}
                >
                    <Ionicons
                        name="arrow-back"
                        size={22}
                        color={AppColors.primaryColor}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Order Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Info</Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Order Number: </Text>
                        {orderDetails?.order?.orderNumber}
                    </Text>
                    <Text style={styles.detailText}>
                        {/* {console.log('orderDetails.OrderDetails.payMethod', orderDetails.OrderDetails.PayMethod)} */}
                        <Text style={styles.label}>Payment Mode: </Text>
                        {orderDetails?.order?.paymentMethod}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Status: </Text>
                        {orderDetails?.order?.orderStatusText}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Order Placed Date and Time: </Text>
                        {new Date(orderDetails?.order?.orderDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Delivery Agent Accepted Date and Time: </Text>
                        {new Date(orderDetails?.order?.deliveryAgentAcceptedOn).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Order Delivered Date and Time: </Text>
                        {new Date(orderDetails?.order?.deliveredAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </Text>
                </View>

                {/* Customer Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Customer Details</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (orderDetails?.customer?.phone) {
                                    Linking.openURL(`tel:${orderDetails.customer.phone}`);
                                } else {
                                    Alert.alert("Phone number not available");
                                }
                            }}
                        >
                            <Ionicons name="call" size={20} color={AppColors.red} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Name: </Text>
                        {orderDetails?.customer?.custName}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Address: </Text>
                        {address}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Landmark: </Text>
                        {orderDetails?.customer?.landmark}
                    </Text>
                    <Text style={styles.detailText}>
                        <Text style={styles.label}>Phone No: </Text>
                        {orderDetails?.customer?.phone}
                    </Text>
                </View>

                {/* Order Items */}
                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>

                    {/* Headers */}
                    <View style={[styles.itemRow, styles.itemHeaderRow]}>
                        <Text style={[styles.itemText, styles.itemHeader, { flex: 2 }]}>Item Name</Text>
                        <Text style={[styles.itemText, styles.itemHeader, { flex: 1, textAlign: "center" }]}>SKU</Text>
                        <Text style={[styles.itemText, styles.itemHeader, { flex: 1, textAlign: "center" }]}>Price</Text>
                        <Text style={[styles.itemText, styles.itemHeader, { flex: 1, textAlign: "center" }]}>Quantity</Text>
                    </View>

                    {/* Items */}
                    <FlatList
                        data={orderDetails?.items}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.itemRow}>
                                <Text style={[styles.itemText, { flex: 2 }]}>{item.productName}</Text>
                                <Text style={[styles.itemText, { flex: 1, textAlign: "center" }]}>{item.sku}</Text>
                                <Text style={[styles.itemText, { flex: 1, textAlign: "center" }]}>₹{item.lineTotal}</Text>
                                <Text style={[styles.itemText, { flex: 1, textAlign: "center" }]}>{item.quantity}</Text>
                            </View>
                        )}
                    />
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Sub Total:</Text>
                        <Text style={styles.value}>₹{orderDetails?.summary?.subtotal}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Discount:</Text>
                        <Text style={styles.value}>₹{orderDetails?.summary?.discountTotal}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Delivery Charge:</Text>
                        <Text style={styles.value}>₹{orderDetails?.summary?.deliveryCharge}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Grand Total:</Text>
                        <Text style={styles.value}>₹{orderDetails?.summary?.grandTotal}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 10 }]}>
                        <Text style={[styles.label, { fontFamily: Fonts.OpenSansBold }]}>
                            Amount to be Collected:
                        </Text>
                        <Text style={[styles.value, { fontFamily: Fonts.OpenSansBold }]}>
                            ₹{
                                // (Number(orderDetails?.summary?.grandTotal || 0) +
                                //     Number(orderDetails?.summary?.deliveryCharge || 0)).toFixed(2)
                                orderDetails?.summary?.grandTotal
                            }
                        </Text>
                    </View>
                </View>
            </ScrollView>
            {/* {tab === "PENDING" || tab === "DELIVERING" && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[styles.bottomButton, { backgroundColor: AppColors.blue }]}
                        onPress={handleNavigate}
                    >
                        <Text style={styles.bottomButtonText}>Navigate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.bottomButton, { backgroundColor: AppColors.green }]}
                        onPress={handleDeliverOrder}
                    >
                        <Text style={styles.bottomButtonText}>Deliver Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.bottomButton, { backgroundColor: AppColors.red }]}
                        onPress={handleCallKapra}
                    >
                        <Text style={styles.bottomButtonText}>Call Kapra</Text>
                    </TouchableOpacity>
                </View>
            )} */}
            {/* <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.bottomButton, { backgroundColor: AppColors.blue }]}
                    onPress={handleNavigate}
                >
                    <Text style={styles.bottomButtonText}>Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.bottomButton, { backgroundColor: AppColors.green }]}
                    onPress={handleDeliverOrder}
                >
                    <Text style={styles.bottomButtonText}>Deliver Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.bottomButton, { backgroundColor: AppColors.red }]}
                    onPress={handleCallKapra}
                >
                    <Text style={styles.bottomButtonText}>Call Kapra</Text>
                </TouchableOpacity>
            </View> */}

        </SafeAreaView>
    );
};

export default OrderDeliveredDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.appBackgroundColor,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        backgroundColor: AppColors.whiteColor,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        justifyContent: "space-between"
    },
    backButton: {
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: Fonts.OpenSansBold,
        color: AppColors.primaryColor,
    },
    scrollContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    section: {
        backgroundColor: AppColors.whiteColor,
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.OpenSansBold,
        color: AppColors.primaryColor,
        marginBottom: 8,
    },
    detailText: {
        fontSize: 13,
        fontFamily: Fonts.OpenSansRegular,
        color: AppColors.black,
        marginBottom: 4,
    },
    label: {
        fontFamily: Fonts.OpenSansSemiBold,
    },
    value: {
        fontFamily: Fonts.OpenSansRegular,
    },
    itemRow: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
        paddingVertical: 6,
    },
    itemText: {
        fontSize: 13,
        color: AppColors.black,
        fontFamily: Fonts.OpenSansRegular,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    bottomContainer: {
        flexDirection: "column", // Vertical layout
        justifyContent: "center",
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        backgroundColor: AppColors.whiteColor,
    },
    bottomButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 6,
    },
    bottomButtonText: {
        color: AppColors.whiteColor,
        fontFamily: Fonts.OpenSansBold,
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noDataText: {
        fontFamily: Fonts.OpenSansSemiBold,
        color: AppColors.black,
    },
    itemHeaderRow: {
        borderBottomWidth: 1,
        borderBottomColor: "#aaa",
        paddingBottom: 6,
        marginBottom: 4,
    },

    itemHeader: {
        fontFamily: Fonts.OpenSansBold,
        color: AppColors.primaryColor,
        fontSize: 13,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: AppColors.whiteColor,
        padding: 25,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        fontFamily: Fonts.OpenSansRegular,
        color: AppColors.black,
        textAlign: 'center',
        marginBottom: 10,
    },
    orderNoText: {
        fontFamily: Fonts.OpenSansBold,
        color: AppColors.black,
        fontSize: 17
    },
    okButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 25,
        backgroundColor: AppColors.red,
        borderRadius: 8
    },
    okButtonText: {
        color: AppColors.whiteColor,
        fontSize: 16,
        fontFamily: Fonts.OpenSansBold,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        marginTop: 15,
        width: '100%',
    },
    modalButton: {
        flex: 1,              // equal width
        paddingVertical: 12,  // equal height
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // marginBottom: 8,
        marginRight: 10
    },
});
