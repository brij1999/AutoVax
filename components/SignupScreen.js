import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NeomorphFlex } from 'react-native-neomorph-shadows';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import superagent from 'superagent';
import isEmpty from '../utils/isEmpty';
import storage from '../utils/storage';
import setAuthToken from '../utils/setAuthToken';
import authTokenPresent from '../utils/authTokenPresent';

const SignupScreen = ({ navigation }) => {
    useEffect(async () => {
		if (await authTokenPresent()) navigation.navigate('Home');
	});
	
	const [name, setName] = React.useState(null);
	const [number, setNumber] = React.useState(null);
	const [is45Plus, setIs45Plus] = React.useState(false);
	const [PIN, setPIN] = React.useState(null);
	const [selectedState, setSelectedState] = useState(null);
	const [selectedDistrict, setSelectedDistrict] = useState(null);
	const [stateList, setStateList] = useState([]);
	const [districtList, setDistrictList] = useState([]);
	const [prefferedVaccine, setPrefferedVaccine] = React.useState(null);
	const [isFree, setIsFree] = React.useState(null);
	const [prefferedTime, setPrefferedTime] = React.useState(1);

	if (isEmpty(stateList)) {
		// console.log('STARTING!');
		// const statesRes = await axios.get('https://google.com');
		// console.log(statesRes);
		// states = statesRes.json();
		setStateList([
			{ state_id: 1, state_name: 'Andaman and Nicobar Islands' },
			{ state_id: 2, state_name: 'Andhra Pradesh' },
			{ state_id: 3, state_name: 'Arunachal Pradesh' },
			{ state_id: 4, state_name: 'Assam' },
			{ state_id: 5, state_name: 'Bihar' },
			{ state_id: 6, state_name: 'Chandigarh' },
			{ state_id: 7, state_name: 'Chhattisgarh' },
			{ state_id: 8, state_name: 'Dadra and Nagar Haveli' },
			{ state_id: 37, state_name: 'Daman and Diu' },
			{ state_id: 9, state_name: 'Delhi' },
			{ state_id: 10, state_name: 'Goa' },
			{ state_id: 11, state_name: 'Gujarat' },
			{ state_id: 12, state_name: 'Haryana' },
			{ state_id: 13, state_name: 'Himachal Pradesh' },
			{ state_id: 14, state_name: 'Jammu and Kashmir' },
			{ state_id: 15, state_name: 'Jharkhand' },
			{ state_id: 16, state_name: 'Karnataka' },
			{ state_id: 17, state_name: 'Kerala' },
			{ state_id: 18, state_name: 'Ladakh' },
			{ state_id: 19, state_name: 'Lakshadweep' },
			{ state_id: 20, state_name: 'Madhya Pradesh' },
			{ state_id: 21, state_name: 'Maharashtra' },
			{ state_id: 22, state_name: 'Manipur' },
			{ state_id: 23, state_name: 'Meghalaya' },
			{ state_id: 24, state_name: 'Mizoram' },
			{ state_id: 25, state_name: 'Nagaland' },
			{ state_id: 26, state_name: 'Odisha' },
			{ state_id: 27, state_name: 'Puducherry' },
			{ state_id: 28, state_name: 'Punjab' },
			{ state_id: 29, state_name: 'Rajasthan' },
			{ state_id: 30, state_name: 'Sikkim' },
			{ state_id: 31, state_name: 'Tamil Nadu' },
			{ state_id: 32, state_name: 'Telangana' },
			{ state_id: 33, state_name: 'Tripura' },
			{ state_id: 34, state_name: 'Uttar Pradesh' },
			{ state_id: 35, state_name: 'Uttarakhand' },
			{ state_id: 36, state_name: 'West Bengal' },
		]);
	}

	const onChangeState = async (itemValue) => {
		if (itemValue === '0') return;
		/* const choice = JSON.parse(itemValue);
        setSelectedState(choice.state_name);
        const distRes = await axios.get(
			`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${choice.state_id}`,
		);
        districts = distRes.json();
        setSelectedDistrict(null); */

		setDistrictList([
			{ district_id: 320, district_name: 'Agar' },
			{ district_id: 357, district_name: 'Alirajpur' },
			{ district_id: 334, district_name: 'Anuppur' },
			{ district_id: 354, district_name: 'Ashoknagar' },
			{ district_id: 338, district_name: 'Balaghat' },
			{ district_id: 343, district_name: 'Barwani' },
			{ district_id: 362, district_name: 'Betul' },
			{ district_id: 351, district_name: 'Bhind' },
			{ district_id: 312, district_name: 'Bhopal' },
			{ district_id: 342, district_name: 'Burhanpur' },
			{ district_id: 328, district_name: 'Chhatarpur' },
			{ district_id: 337, district_name: 'Chhindwara' },
			{ district_id: 327, district_name: 'Damoh' },
			{ district_id: 350, district_name: 'Datia' },
			{ district_id: 324, district_name: 'Dewas' },
			{ district_id: 341, district_name: 'Dhar' },
			{ district_id: 336, district_name: 'Dindori' },
			{ district_id: 348, district_name: 'Guna' },
			{ district_id: 313, district_name: 'Gwalior' },
			{ district_id: 361, district_name: 'Harda' },
			{ district_id: 360, district_name: 'Hoshangabad' },
			{ district_id: 314, district_name: 'Indore' },
			{ district_id: 315, district_name: 'Jabalpur' },
			{ district_id: 340, district_name: 'Jhabua' },
			{ district_id: 353, district_name: 'Katni' },
			{ district_id: 339, district_name: 'Khandwa' },
			{ district_id: 344, district_name: 'Khargone' },
			{ district_id: 335, district_name: 'Mandla' },
			{ district_id: 319, district_name: 'Mandsaur' },
			{ district_id: 347, district_name: 'Morena' },
			{ district_id: 352, district_name: 'Narsinghpur' },
			{ district_id: 323, district_name: 'Neemuch' },
			{ district_id: 326, district_name: 'Panna' },
			{ district_id: 359, district_name: 'Raisen' },
			{ district_id: 358, district_name: 'Rajgarh' },
			{ district_id: 322, district_name: 'Ratlam' },
			{ district_id: 316, district_name: 'Rewa' },
			{ district_id: 317, district_name: 'Sagar' },
			{ district_id: 333, district_name: 'Satna' },
			{ district_id: 356, district_name: 'Sehore' },
			{ district_id: 349, district_name: 'Seoni' },
			{ district_id: 332, district_name: 'Shahdol' },
			{ district_id: 321, district_name: 'Shajapur' },
			{ district_id: 346, district_name: 'Sheopur' },
			{ district_id: 345, district_name: 'Shivpuri' },
			{ district_id: 331, district_name: 'Sidhi' },
			{ district_id: 330, district_name: 'Singrauli' },
			{ district_id: 325, district_name: 'Tikamgarh' },
			{ district_id: 318, district_name: 'Ujjain' },
			{ district_id: 329, district_name: 'Umaria' },
			{ district_id: 355, district_name: 'Vidisha' },
		]);
	};

	const onChangeDistrict = async (itemValue) => {
		if (itemValue === '0') return;
		const choice = JSON.parse(itemValue);
		setSelectedDistrict(choice.district_name);
	};

	const onChangeAge = () => setIs45Plus((previousState) => !previousState);

	const onSubmit = async () => {
		const uniqueID = await DeviceInfo.getUniqueId();
		console.log(uniqueID);
		const details = {
			mobile: number,
			pin: PIN,
			state: selectedState,
			district: selectedDistrict,
			name,
			is45Plus,
			prefferedVaccine,
			isFree,
			prefferedTime,
			uniqueID,
		};
		console.log(details);
		/* const subRes = await axios.post('/auth/signup', details);
		const { token } = await subRes.data;
		storage.save({
			key: 'jwtToken',
			data: { token },
		});
		setAuthToken(token); */
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Automation Registration</Text>
			</View>
			<View style={{ ...styles.section, marginTop: 80 }}>
				<Text style={styles.sectionText}>Login Info:</Text>
				<NeomorphFlex useArt swapShadows style={styles.neomorphBox}>
					<TextInput style={styles.input} onChangeText={setName} value={name} placeholder='Name' />
				</NeomorphFlex>
				<NeomorphFlex useArt swapShadows style={styles.neomorphBox}>
					<TextInput
						style={styles.input}
						onChangeText={setNumber}
						value={number}
						placeholder='Phone Number (without +91)'
						keyboardType='numeric'
					/>
				</NeomorphFlex>
				<View style={styles.btnUnit}>
					<Text>Are you 45+ ?</Text>
					<View style={styles.btnWrapper}>
						<Text style={styles.btnOptionText}>No</Text>
						<Switch
							trackColor={{ true: '#ddd', false: '#767577' }}
							thumbColor={is45Plus ? '#23b9ff' : '#f4f3f4'}
							onValueChange={onChangeAge}
							value={is45Plus}
						/>
						<Text style={styles.btnOptionText}>Yes</Text>
					</View>
				</View>
			</View>
			<View style={styles.section}>
				<Text style={styles.sectionText}>Location Info:</Text>
				<NeomorphFlex useArt swapShadows style={styles.neomorphBox}>
					<Picker style={styles.input} selectedValue={selectedState} onValueChange={onChangeState}>
						<Picker.Item label='Select State' value='0' />
						{stateList.map((item) => (
							<Picker.Item key={item.state_id} label={item.state_name} value={JSON.stringify(item)} />
						))}
					</Picker>
				</NeomorphFlex>
				<NeomorphFlex useArt swapShadows style={styles.neomorphBox}>
					<Picker style={styles.input} selectedValue={selectedDistrict} onValueChange={onChangeDistrict}>
						<Picker.Item label='Select District' value='0' />
						{districtList.map((item) => (
							<Picker.Item
								key={item.district_id}
								label={item.district_name}
								value={JSON.stringify(item)}
							/>
						))}
					</Picker>
				</NeomorphFlex>
				<NeomorphFlex useArt swapShadows style={styles.neomorphBox}>
					<TextInput
						style={styles.input}
						onChangeText={setPIN}
						value={PIN}
						placeholder='Pincode'
						keyboardType='numeric'
					/>
				</NeomorphFlex>
			</View>
			<View style={styles.section}>
				<Text style={styles.sectionText}>Optional Preferences:</Text>
				<Text style={{ ...styles.btnOptionText, marginTop: 5 }}>Vaccine Preference:</Text>
				<View style={styles.btnGroup}>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedVaccine('Covishield')}>
						<Text style={styles.btnText}>Covishield</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedVaccine('Covaxin')}>
						<Text style={styles.btnText}>Covaxin</Text>
					</TouchableOpacity>
				</View>
				<Text style={{ ...styles.btnOptionText, marginTop: 10 }}>Cost Preference:</Text>
				<View style={styles.btnGroup}>
					<TouchableOpacity style={styles.btn} onPress={() => setIsFree(true)}>
						<Text style={styles.btnText}>Free</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setIsFree(false)}>
						<Text style={styles.btnText}>Paid</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.section}>
				<Text style={styles.sectionText}>Slot Booking Preferences:</Text>
				<Text style={{ ...styles.btnOptionText, marginTop: 5 }}>Time Preference:</Text>
				<View style={styles.btnGroup}>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedTime(1)}>
						<Text style={styles.btnText}>09:00AM - 11:00AM</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedTime(2)}>
						<Text style={styles.btnText}>11:00AM - 01:00PM</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedTime(3)}>
						<Text style={styles.btnText}>01:00PM - 03:00PM</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedTime(4)}>
						<Text style={styles.btnText}>03:00PM - 05:00PM</Text>
					</TouchableOpacity>
				</View>
			</View>
			<TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
				<NeomorphFlex useArt swapShadows style={styles.neoSubmitBox}>
					<Text style={styles.submitBtnText}>SUBMIT</Text>
				</NeomorphFlex>
			</TouchableOpacity>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingLeft: 10,
		paddingRight: 10,
		backgroundColor: '#f0f0f0',
	},
	header: {
		width: Dimensions.get('window').width,
		position: 'absolute',
		left: 0,
		top: 0,
		paddingVertical: 15,
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,

		elevation: 5,
	},
	headerText: {
		color: '#23b9ff',
		fontSize: 20,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	section: {
		width: '100%',
		marginTop: 20,
		position: 'relative',
		borderColor: '#999',
		borderRadius: 5,
		borderWidth: 1,
		paddingLeft: 13,
		paddingRight: 14,
		paddingTop: 15,
		paddingBottom: 15,
		backgroundColor: '#f0f0f0',
	},
	sectionText: {
		color: '#23b9ff',
		fontSize: 15,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	neomorphBox: {
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 2,
		borderRadius: 2,
		backgroundColor: '#f9f9f9',
		marginBottom: 10,
	},
	input: {
		paddingLeft: 15,
	},
	btnUnit: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 5,
	},
	btnWrapper: {
		flexDirection: 'row',
	},
	btnOptionText: {},
	btnGroup: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		width: '100%',
		flexWrap: 'wrap',
	},
	btn: {
		//flex: 1,
		flexBasis: '45%',
		alignItems: 'center',
		backgroundColor: '#f9f9f9',
		padding: 10,
		margin: 5,
		borderColor: '#23b9ff',
		borderWidth: 1,
		borderRadius: 5,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,

		elevation: 5,
	},
	btnText: {
		color: '#23b9ff',
		fontWeight: 'bold',
	},
	submitBtn: {
		flex: 1,
		alignItems: 'center',
		marginHorizontal: 10,
		marginVertical: 20,
	},
	neoSubmitBox: {
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 2,
		borderRadius: 2,
		backgroundColor: '#23b9ff',
		marginBottom: 10,
		width: '100%',
	},
	submitBtnText: {
		textAlign: 'center',
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 2,
		paddingVertical: 12,
	},
});

export default SignupScreen;
