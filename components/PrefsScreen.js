import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NeomorphFlex } from 'react-native-neomorph-shadows';
import axios from 'axios';
import isEmpty from '../utils/isEmpty';
import { useDispatch, useSelector } from 'react-redux';
import { setUserPrefs } from '../redux/actions/User Actions';
import { API_STATES, API_DISTRICTS } from '../ENV';

const PrefsScreen = ({ navigation }) => {
    const dispatch = useDispatch();
	const prefs = useSelector((state) => state.user);

	const [number, setNumber] = useState(prefs.mobile);
	const [is45Plus, setIs45Plus] = useState(prefs.is45Plus);
	const [PIN, setPIN] = useState(prefs.pin);
	const [selectedState, setSelectedState] = useState(prefs.state);
	const [selectedDistrict, setSelectedDistrict] = useState(null);
	const [districtID, setDistrictID] = useState(prefs.district);
	const [prefferedVaccine, setPrefferedVaccine] = useState(prefs.prefferedVaccine);
	const [fees, setFees] = useState(prefs.fees);
	const [prefferedTime, setPrefferedTime] = useState(prefs.prefferedTime);
	const [dose, setDose] = useState(prefs.dose);
	const [stateList, setStateList] = useState([]);
	const [districtList, setDistrictList] = useState([]);

    useEffect(() => {
        const init = async () => {
            const statesRes = await axios.get(API_STATES);
			setStateList(statesRes.data.states);
        };
        init();
	}, []);

	const onChangeState = async (itemValue) => {
		if (itemValue === '0') return;
		const choice = JSON.parse(itemValue);
		setSelectedState(choice.state_name);
		const distRes = await axios.get(`${API_DISTRICTS}/${choice.state_id}`);
		setDistrictList(distRes.data.districts);
		setSelectedDistrict(null);
	};

	const onChangeDistrict = async (itemValue) => {
		if (itemValue === '0') return;
		const choice = JSON.parse(itemValue);
		setSelectedDistrict(choice.district_name);
        setDistrictID(choice.district_id);
	};

	const onChangeAge = () => setIs45Plus((previousState) => !previousState);

	const onSubmit = async () => {
		const details = {
			mobile: number,
			pin: PIN,
			state: selectedState,
			district: districtID,
			firebaseToken: prefs.firebaseToken,
			is45Plus,
			prefferedVaccine,
			fees,
			prefferedTime,
			dose,
		};
		try {
            dispatch(setUserPrefs(details));
			navigation.navigate('HomeScreen');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Automation Registration</Text>
			</View>
			<View style={{ ...styles.section, marginTop: 80 }}>
				<Text style={styles.sectionText}>Login Info:</Text>
				<NeomorphFlex swapShadows style={styles.neomorphBox}>
					<TextInput
						style={styles.input}
						onChangeText={setNumber}
						value={number}
						placeholder='Phone Number (without +91)'
						keyboardType='numeric'
					/>
				</NeomorphFlex>
				<View style={styles.btnUnit}>
					<Text>Are the considered dependents 45+ ?</Text>
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
				<Text style={{ ...styles.btnOptionText, marginTop: 5 }}>Select Dose:</Text>
				<View style={styles.btnGroup}>
					<TouchableOpacity style={styles.btn} onPress={() => setDose(1)}>
						<Text style={styles.btnText}>Dose 1</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setDose(2)}>
						<Text style={styles.btnText}>Dose 2</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.section}>
				<Text style={styles.sectionText}>Location Info:</Text>
				<NeomorphFlex swapShadows style={styles.neomorphBox}>
					<Picker style={styles.input} selectedValue={selectedState} onValueChange={onChangeState}>
						<Picker.Item label='Select State' value='0' />
						{stateList.map((item) => (
							<Picker.Item key={item.state_id} label={item.state_name} value={JSON.stringify(item)} />
						))}
					</Picker>
				</NeomorphFlex>
				<NeomorphFlex swapShadows style={styles.neomorphBox}>
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
				<NeomorphFlex swapShadows style={styles.neomorphBox}>
					<TextInput
						style={styles.input}
						onChangeText={setPIN}
						value={PIN}
						placeholder='Preffered Pincodes (separated by comma)'
						keyboardType='numeric'
					/>
				</NeomorphFlex>
				<Text style={{ ...styles.btnOptionText, marginTop: 5 }}>
					➤ Leave the Pincode field empty, to look for slots anywhere in the city.
				</Text>
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
			<View style={styles.section}>
				<Text style={styles.sectionText}>Optional Preferences:</Text>
				<Text style={{ ...styles.btnOptionText, marginTop: 5 }}>Vaccine Preference:</Text>
				<View style={styles.btnGroup}>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedVaccine('covishield')}>
						<Text style={styles.btnText}>Covishield</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setPrefferedVaccine('covaxin')}>
						<Text style={styles.btnText}>Covaxin</Text>
					</TouchableOpacity>
				</View>
				<Text style={{ ...styles.btnOptionText, marginTop: 10 }}>Cost Preference:</Text>
				<View style={styles.btnGroup}>
					<TouchableOpacity style={styles.btn} onPress={() => setFees('free')}>
						<Text style={styles.btnText}>Free</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn} onPress={() => setFees('paid')}>
						<Text style={styles.btnText}>Paid</Text>
					</TouchableOpacity>
				</View>
			</View>
			<TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
				<NeomorphFlex swapShadows style={styles.neoSubmitBox}>
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
	btnOptionText: {
        textAlign: 'justify',
    },
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

export default PrefsScreen;
