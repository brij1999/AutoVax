import axios from 'axios';
import { API_BENEFICIARIES } from '../ENV';
import isEmpty from '../utils/isEmpty';
import { authTokenPresent } from '../utils/authUtils';
import floatingNotify from '../utils/floatingNotify';
import { store } from '../redux/store';
import { setBeneficiaries, setBookingParams } from '../redux/actions/Auto Actions';

export const getBeneficiaries = async () => {
    const state = store.getState();
    try {
        if (!(await authTokenPresent())) return;
		const res = await axios.get(API_BENEFICIARIES);
		const ben = res.data.beneficiaries;
        console.log({ben});
        if (isEmpty(ben)) return;
        const prefs = state.user;
		const age = prefs.is45Plus ? 45 : 18;
		const dose = prefs.dose;
		const vaccine = prefs.prefferedVaccine;
		for (let i = 0; i < ben.length; ++i) {
			const b = ben[i];
			const ageB = 2021 - parseInt(b['birth_year']);
			const doseC = (dose === 1 && b['dose1_date'] === '') || (dose === 2 && b['dose1_date'] !== '');
			const ageC = age === 18 ? ageB >= 18 && ageB < 45 : ageB >= 45;
			const vaccineC =
				dose === 1 || (dose === 2 && (!vaccine || vaccine === b['vaccine'].replace(/ /g, '-').toLowerCase()));
			ben[i].allow = doseC && ageC && vaccineC;
		}
		const params = {
			dose,
			ben: ben.filter((b) => b.allow).map((b) => b['beneficiary_reference_id']),
		};
		console.log({ params });
		store.dispatch(setBookingParams(params));
		store.dispatch(setBeneficiaries(ben));
    } catch (error) {
        console.log('Error <getBeneficiaries>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
    }
};