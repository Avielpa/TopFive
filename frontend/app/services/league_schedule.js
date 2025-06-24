import { useEffect, useState } from "react";
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:8000/api';

export const getAllMatches = async () =>{
    try{
        const response = await axios.get(`${BASE_URL}/matches/`)
        return response.data

    }catch{
        console.error('Enable to get natches', error);
        throw error;

    }
}