import axios from "axios"

axios.defaults.baseURL = 'http://127.0.0.1:8888/api';

export const getAllDrugs = () => {
    return axios.get("/drugs")
        .catch(err => console.log(err))
        .then(res => { return res.data })
}

export const getAllAdverseReactions = () => {
    return axios.get("/adversereactions")
        .catch(err => console.log(err))
        .then(res => {return res.data})
}

export const queryKeyword = (keyword) => {
    return axios.get("/query/"+keyword)
        .catch(err => console.log(err))
        .then(res => {return res.data})
}

export const getDrugsByAdverseReaction = (meddraID) => {
    return axios.get("/adversereactions/"+meddraID)
        .catch(err => console.log(err))
        .then(res => {return res.data})
}

export const getDrugInfo = (drugID) => {
    return axios.get("/drugs/"+drugID)
        .catch(err => console.log(err))
        .then(res => {return res.data})
}


export const getStats = () => {
    return axios.get("/stats")
    .catch(err => console.log(err))
    .then(res => {return res.data})
}
