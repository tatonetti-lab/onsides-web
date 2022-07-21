import axios from "axios";

axios.defaults.headers["Authorization"] = "apikey token=c604582c-e8e6-4a84-8c0d-4264fcb526ca";

const getCUI = (term_name) => {
    return axios.get("http://data.bioontology.org/search?q=" + term_name, {
        params: {
            ontologies: "MEDDRA",
            require_exact_match: true,
            pagesize: 1,
        }
    })
}

const searchByCUI = (cui) => {
    return axios.get("http://data.bioontology.org/search?q=" + cui, {
        params: {
            ontologies: "NCIT",
            also_search_properties:true,
            require_definiton: true,
            include: "prefLabel,definition",
            pagesize: 1,
        }
    })
}

const searchByName = (term_name) => {
    return axios.get("http://data.bioontology.org/search?q=" + term_name, {
        params: {
            ontologies: "NCIT",
            require_exact_match:true,
            require_definiton: true,
            include: "prefLabel,definition",
            pagesize: 1,
        }
    })
}

// first check if NCIT has exact match, if not use MEDDRA to find cui and search for that
export const getDefiniton = async (term_name) => {

    let def = await (await searchByName(term_name)).data.collection[0]?.definition[0];
    
    if (def === undefined) {
        let cui = await (await getCUI(term_name)).data.collection[0].cui[0];

        def = await (await searchByCUI(cui)).data.collection[0]?.definition[0];
    }

    return def;

}