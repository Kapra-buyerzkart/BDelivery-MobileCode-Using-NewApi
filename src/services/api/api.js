import apiClient from "./apiClient";

export const login = (phoneNo, password) => {
    return apiClient.post("/deliveryagent/auth/login", {
        phone: phoneNo,
        password: password,
    });
};

export const changePwd = (oldPassword, newPassword) => {
    return apiClient.post("/deliveryagent/changepassword", {
        oldpassword: oldPassword,
        newpassword: newPassword
    });
};

export const fetchProfileDetails = () => {
    return apiClient.get('deliveryagent/profile');
};

export const logout = (refreshToken) => {
    console.log('refreshToken', refreshToken)
    return apiClient.post("/auth/logout", {
        refreshToken: refreshToken
    });
};

export const forgotPwd = (mobileNumber) => {
    return apiClient.get(`/Auth/ForgotPassword?mobileNumber=${mobileNumber}`);
};

export const sendOtp = (phoneNo) => {
    return apiClient.post("/deliveryagent/auth/sendotp", {
        phone: phoneNo
    });
};

export const verifyOtp = (phoneNo, otp, otpType) => {
    return apiClient.post("/deliveryagent/auth/verifyotp", {
        phone: phoneNo,
        otp: otp,
        otpType: otpType
    });
};

export const resetPwd = (resetToken, newPassword) => {
    return apiClient.post("/deliveryagent/auth/resetpassword", {
        resetToken,
        newPassword
    });
};

export const resendOtp = (phoneno) => {
    return apiClient.post("/Auth/ReSendOTP", {
        phoneno: phoneno
    });
}

// export const assignedOrders = (agentId) => {
//     return apiClient.get(`/DeliveryAgent/by-agentorder?agentId=${agentId}`);
// };

// export const modifyOrderStatus = (orderId, agentId, status) => {
//     return apiClient.post("Delivery/ModifyStatustAssignedOrders", {
//         orderId: orderId,
//         delAgentId: agentId,
//         status: status
//     });
// };

export const modifyOrderStatus = (orderId, newstatuskey, latitude, longitude, deliverynote, deliverysignimageurl) => {
    return apiClient.post("deliveryagent/orders/updatestatus", {
        orderId,
        newstatuskey,
        latitude,
        longitude,
        deliverynote,
        deliverysignimageurl
    });
};

export const getAllOrders = (tab) => {
    return apiClient.get(`/deliveryagent/orders?tabKey=${tab}`)
}

// export const fetchOrderDetails = (orderId) => {
//     return apiClient.get(`/Order/CustOrderItemList?orderId=${orderId}`);
// };

export const fetchOrderDetails = (orderId) => {
    return apiClient.get(`/deliveryagent/orders/${orderId}`);
};

export const completeOrderDelivery = (orderId, delAgentId, status, signImage, deliveryNote, deliveryFreebies) => {
    return apiClient.post("/Delivery/OrderDeliveryComplete", {
        orderId,
        delAgentId,
        status,
        signImage,
        deliveryNote,
        deliveryFreebies,
    });
};

export const markAttendance = (status, latitude, longitude) => {
    return apiClient.post("/deliveryagent/attendance/mark", {
        status,
        longitude,
        latitude
    });
};

export const fetchAttendance = (StartDate, EndDate) => {
    // console.log("StartDate", StartDate)
    // console.log('EndDate', EndDate)
    // return apiClient.get(`/DeliveryAgent/attendanceDateRange?deliveryBoyId=${DeliveryBoyId}&startDate=${StartDate}&endDate=${EndDate}`);
    return apiClient.get(`/deliveryagent/attendance/report?fromdate=${StartDate}&todate=${EndDate}`);
}

export const fetchEarnings = (StartDate, EndDate) => {
    // console.log("StartDate", StartDate)
    // console.log('EndDate', EndDate)
    // return apiClient.get(`/DeliveryAgent/attendanceDateRange?deliveryBoyId=${DeliveryBoyId}&startDate=${StartDate}&endDate=${EndDate}`);
    return apiClient.get(`/deliveryagent/Earnings/report?fromdate=${StartDate}&todate=${EndDate}`);
}

export const fetchDeliveryAgentAcceptedOrders = (agentId) => {
    // console.log("accepted")
    return apiClient.get(`/DeliveryAgent/GetAllOrderSuperMarketByStatus/?agentid=${agentId}&status=Delivery Agent Accepted`)
}

export const fetchDeliveredOrders = (agentId) => {
    // console.log("delivered")
    return apiClient.get(`/DeliveryAgent/GetAllOrderSuperMarketByStatus/?agentid=${agentId}&status=Order Delivered`)
}

export const assignedOrders = (agentId) => {
    return apiClient.get(`/deliveryagent/orders`);
};
