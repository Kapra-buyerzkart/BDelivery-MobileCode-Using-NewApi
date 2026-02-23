// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import firestore from '@react-native-firebase/firestore';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Async thunk to fetch agent details

// export const fetchAgentDetails = createAsyncThunk(
//     'agent/fetchAgentDetails',
//     async (_, thunkAPI) => {
//         try {
//             // Get agentId from AsyncStorage
//             const agentId = await AsyncStorage.getItem('id');
//             // console.log("fetchAgentDetails calling....")
//             if (!agentId) {
//                 throw new Error('Agent ID not found in storage');
//             }

//             // Fetch document from Firestore
//             const docSnap = await firestore().collection('deliveryAgents').doc(agentId).get();

//             if (docSnap.exists) {
//                 return { agentId, ...docSnap.data() };
//             } else {
//                 throw new Error('No such document!');
//             }
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// const agentSlice = createSlice({
//     name: 'agent',
//     initialState: {
//         agentId: null,
//         mobile: '',
//         name: '',
//         password: '',
//         storeName: '',
//         storeId: '',
//         type: '',
//         completedOrders: [],
//         attendance: [],
//         status: 'idle',
//         error: null,
//     },
//     reducers: {
//         clearAgentDetails: (state) => {
//             state.agentId = null;
//             state.mobile = '';
//             state.name = '';
//             state.password = '';
//             state.storeName = '';
//             state.storeId = '';
//             state.type = '';
//             state.completedOrders = [];
//             state.attendance = [];
//             state.status = 'idle';
//             state.error = null;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchAgentDetails.pending, (state) => {
//                 state.status = 'loading';
//             })
//             .addCase(fetchAgentDetails.fulfilled, (state, action) => {
//                 const data = action.payload;
//                 state.status = 'succeeded';
//                 state.mobile = data.mobile;
//                 state.name = data.name;
//                 state.password = data.password;
//                 state.storeName = data.storeName;
//                 state.storeId = data.storeId;
//                 state.type = data.type;
//                 state.completedOrders = data.completedOrders || [];
//                 state.agentId = data.id
//                 state.attendance = data.attendance
//             })
//             .addCase(fetchAgentDetails.rejected, (state, action) => {
//                 state.status = 'failed';
//                 state.error = action.error.message;
//             });
//     },
// });

// export const { clearAgentDetails } = agentSlice.actions;

// export default agentSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfileDetails } from '../../services/api/api';

// ✅ Async thunk to fetch agent details from API
export const fetchAgentDetails = createAsyncThunk(
    'agent/fetchAgentDetails',
    async (_, thunkAPI) => {
        try {
            // Get agentId from AsyncStorage
            // const agentId = await AsyncStorage.getItem('agentId');
            // if (!agentId) {
            //     throw new Error('Agent ID not found in storage');
            // }

            // ✅ Call API
            const response = await fetchProfileDetails();

            // API structure:
            // {
            //   "Data": {
            //     "agentId": 3,
            //     "agentName": "Agent Alex1",
            //     "emailId": "alex@gmail.com1",
            //     "phoneNo": "9486962974"
            //   },
            //   "Message": "Profile fetched"
            // }
            // console.log('profileresponse', response.data)
            const data = response.data?.data;
            if (!data) {
                throw new Error('Invalid response data');
            }

            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const agentSlice = createSlice({
    name: 'agent',
    initialState: {
        agentId: null,
        name: '',
        email: '',
        phoneNo: '',
        superMarketName: '',
        location: {
            latitude: null,
            longitude: null,
            accuracy: null,
            updatedAt: null,
        },
        status: 'idle',
        error: null,
    },
    reducers: {
        clearAgentDetails: (state) => {
            state.agentId = null;
            state.name = '';
            state.email = '';
            state.phoneNo = '';
            state.superMarketName = '';
            state.location = {
                latitude: null,
                longitude: null,
                accuracy: null,
                updatedAt: null,
            };
            state.status = 'idle';
            state.error = null;
        },
        updateAgentLocation: (state, action) => {
            const { latitude, longitude, accuracy } = action.payload;
            state.location = {
                latitude,
                longitude,
                accuracy,
                updatedAt: Date.now(),
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgentDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAgentDetails.fulfilled, (state, action) => {
                const data = action.payload;
                state.status = 'succeeded';
                state.agentId = data.deliveryAgentId;
                state.name = data.fullName;
                state.email = data.emailId;
                state.phoneNo = data.phoneNo;
                state.superMarketName = data.storeName;
            })
            .addCase(fetchAgentDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearAgentDetails, updateAgentLocation } = agentSlice.actions;
export default agentSlice.reducer;

