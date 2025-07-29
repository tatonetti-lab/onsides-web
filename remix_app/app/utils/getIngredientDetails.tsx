export const getIngredientDetails = async (id: string) => {
    const response = await fetch(`/api/v1/ingredient`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id
        }),
    });
    return response.json();
}