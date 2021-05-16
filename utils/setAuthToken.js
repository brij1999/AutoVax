import axios from 'axios';

const setAuthToken = (token) => {
	if (token) {
		//apply token every request's header
		axios.defaults.headers.common['Authorization'] = token;
        console.log('\n----------: AUTH TOKEN SET :----------\n', token,'\n------------------\n');
	}
	//delete the auth. field from header
	else delete axios.defaults.headers.common['Authorization'];
};

export default setAuthToken;
