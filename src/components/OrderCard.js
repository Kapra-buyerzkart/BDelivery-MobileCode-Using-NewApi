import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../constants/Fonts';
import { AppColors } from '../constants/Colors';
import moment from 'moment';

const OrderCard = ({
    // task_no,
    navigation,
    // id,
    // agentId,
    // pincode,
    // area,
    type, // 'PENDING' | 'DELIVERING' | 'DELIVERED'
    onAccept,
    // deliveredItems,
    // deliveredDate,
    order
}) => {

    const handleViewDetails = () => {
        navigation.navigate("OrderDetails", { orderId: order.orderId });
    };

    const handleViewDeliveredDetails = () => {
        navigation.navigate("OrderDeliveredDetails", { orderId: order.orderId });
    };

    const renderButton = () => {
        if (type === 'PENDING') {
            if (order.isAssignedToMe === 1) {
                return (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: AppColors.green }]}
                        onPress={() => onAccept && onAccept({ orderId: order.orderId, orderNumber: order.orderNumber, agentId: order.delAgentId })}
                    >
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                );
            }
            else {
                return (
                    <TouchableOpacity
                        disabled={true}
                        style={[styles.button, { backgroundColor: AppColors.gray }]}
                        onPress={() => onAccept && onAccept({ orderId: order.orderId, orderNumber: order.orderNumber, agentId: order.delAgentId })}
                    >
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                );
            }
        } else if (type === "DELIVERING") {
            // Both DELIVERING & DELIVERED
            return (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: AppColors.primaryColor }]}
                    onPress={handleViewDetails}
                >
                    <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: AppColors.primaryColor }]}
                    onPress={handleViewDeliveredDetails}
                >
                    <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
            );
        }
    };

    return (
        <View style={styles.orderContainer}>
            {/* Order Header */}
            <View style={styles.orderTitleView}>
                <Text style={styles.label}>Order No:</Text>
                <Text style={styles.value}>{order.orderNumber}</Text>
            </View>

            <View style={styles.orderTitleView}>
                <Text style={styles.label}>Pincode:</Text>
                <Text style={styles.value}>{order.pincode}</Text>
            </View>

            <View style={styles.orderTitleView}>
                <Text style={styles.label}>Area:</Text>
                <Text style={styles.value}>{order.pincodeAreaName}</Text>
            </View>

            {/* Only for DELIVERED */}
            {type === 'DELIVERED' && (
                <>
                    {/* <View style={styles.orderTitleView}>
                        <Text style={styles.label}>Delivered Items:</Text>
                        <Text style={styles.value}>{deliveredItems || 0}</Text>
                    </View> */}

                    <View style={styles.orderTitleView}>
                        <Text style={styles.label}>Delivered Date:</Text>
                        <Text style={styles.value}>
                            {new Date(order.orderDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                                // hour: "2-digit",
                                // minute: "2-digit",
                                // hour12: true,
                            })}
                        </Text>
                    </View>
                    {/* <View style={styles.orderTitleView}>
                        <Text style={styles.label}>Delivered Items:</Text>
                        <Text style={styles.value}>{order.orderItems.length}</Text>
                    </View> */}
                </>
            )}

            <View style={styles.buttonRow}>{renderButton()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    orderContainer: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: AppColors.whiteColor,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    orderTitleView: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontSize: 13,
        color: AppColors.black,
        fontFamily: Fonts.OpenSansSemiBold,
    },
    value: {
        fontSize: 13,
        fontFamily: Fonts.OpenSansBold,
        color: AppColors.black,
        marginLeft: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 10,
    },
    button: {
        paddingVertical: 10,
        borderRadius: 6,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        color: AppColors.whiteColor,
        fontSize: 13,
        fontFamily: Fonts.OpenSansBold,
    },
});

export default OrderCard;
