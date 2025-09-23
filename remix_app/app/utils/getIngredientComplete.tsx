export const getIngredientComplete = async (id: string) => {
    const response = await fetch(`/api/v1/ingredient/complete`, {
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
