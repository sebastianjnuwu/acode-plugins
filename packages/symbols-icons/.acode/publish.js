import axios from 'axios';
import $form_data from 'form-data';
import { createReadStream } from 'node:fs';

const login = async (email, password) => {
  
    const response = await axios.post('https://acode.app/api/login', { email, password }).catch((err) => {
      console.log(err.response.data);
      return;
    });

    const token = response?.headers['set-cookie'][0].split(';')[0].split('=')[1];
    
    if (!token) return null;
    
    return token;
};

const upload = async (_token) => {
 
  const form = new $form_data();
  form.append('plugin', createReadStream('.acode/plugin.zip'));

  const response = await axios.put('https://acode.app/api/plugin', form, {
      headers: {
        ...form.getHeaders(),
        'Cookie': `token=${_token}`,
      },
    }).catch((err) => {
      console.log(err.response.data);
      return;
    });
    
    console.log(response);
    
};

const publish = async () => {

  const _token = await login(process.env.ACODE_EMAIL, process.env.ACODE_PASSWORD);

  if (_token) {
    await upload(_token); 
  }
};

publish();
