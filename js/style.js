import { StyleSheet } from "react-native";

export default StyleSheet.create({
    // Login e Registro
    formContainer: {
        width: "100%",
        paddingBottom: 70,
        paddingTop: 20,
        alignItems: "center",
        backgroundColor: "#FED2E5",
    },
    containerSuperiorAvatar: {
        backgroundColor: "#DDB0C4",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 20,
        width: "100%",
    },
    avatarLogo: {
        width: 140,
        height: 140,
        marginBottom: 10,
    },
    titleApp: {
        fontSize: 28,
        fontFamily: "serif",
        color: "#fff",
        fontWeight: "bold",
    },
    inputContainer: {
        marginTop: 10,
        width: "80%",
    },
    input: {
        backgroundColor: "rgba(173, 126, 148, 0.3)",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 2,
        borderColor: "#CD9CB2",
        color: "#000",
    },
    inputPlaceholder: {
        color: "#CD9CB2",
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#AD7E94",
    },
    buttonContainer: {
        width: "80%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
    },
    button: {
        backgroundColor: "#8F6277",
        width: "100%",
        padding: 15,
        borderRadius: 50,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "Bold",
        fontSize: 16,
    },
    buttonOutline: {
        width: "100%",
        backgroundColor: "#FFE1EE",
        borderWidth: 2,
        borderRadius: 50,
        borderColor: "#8F6277",
        alignItems: "center",
        padding: 15,
        margin: 10,
    },
    buttonOutlineText: {
        color: "#8F6277",
        fontWeight: "700",
        fontSize: 15,
    },
    registerText: {
        marginTop: 15,
        textAlign: "center",
        fontSize: 14,
        color: "#AD7E94",
    },
    registerLink: {
        color: "#8F6277",
        fontWeight: "bold",
    },
    distancia: {
        marginTop: 15,
    },
    logoutIconContainer: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1,
    },

    // Prof
    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: "#FED2E5",
        paddingBottom: 50,
    },
    containerCenter: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#DDB0C4",
    },

    //Home
    containerHome: {
        flex: 1,
        backgroundColor: "#FED2E5",
        justifyContent: "center",
        alignItems: "center",
    },
    rectangle: {
        backgroundColor: "#8F6277",
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 20,
        marginBottom: 15,
    },
    cinefyText: {
        fontSize: 35,
        fontWeight: "bold",
        color: "#FFE1EE",
    },
    avatarImage: {
        width: 290,
        height: 290,
        marginBottom: 15,
    },
    textBelowAvatar: {
        fontSize: 18,
        color: "#8F6277",
        textAlign: "center",
        fontWeight: "600",
    },

    //FLATLIST
    item: {
        alignItems: "justify",
        justifyContent: "space-between",
        backgroundColor: " rgba(173, 126, 148, 0.3)",
        borderRadius: 10,
        padding: 12,
        marginVertical: 12,
        width: "80%",
        borderColor: "#CD9CB2",
        borderWidth: 2,
    },
    titulo: {
        fontSize: 17,
        color: "#8F6277",
        marginBottom: 10,
        flexWrap: "wrap",
        textAlign: "justify",
    },
    imagem: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginTop: 15,
    },
    imagemView: {
        alignContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    buttonSave: {
        backgroundColor: "#8F6277",
        width: "100%",
        padding: 15,
        borderRadius: 50,
        alignItems: "center",
        marginBottom: 80,
    },
    textNews: {
        fontSize: 22,
        color: "#8F6277",
        textAlign: "center",
    },
});
