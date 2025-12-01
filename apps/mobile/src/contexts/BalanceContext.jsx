import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert } from "react-native";

// Taux de change EUR/FCFA
const EXCHANGE_RATE = 655.96;

// Contexte pour gérer les soldes de l'application
const BalanceContext = createContext(null);

export function BalanceProvider({ children, theme }) {
    // Soldes initiaux
    const [balances, setBalances] = useState({
        // Mobile Money en FCFA
        mobileMoneyAccounts: [
            {
                provider: "MTN Mobile Money",
                balance: 45250,
                color: theme.colors.mobileMoneyOrange,
            },
            {
                provider: "Moov Money",
                balance: 25500,
                color: theme.colors.mobileMoneyBlue,
            },
            {
                provider: "Celtiis Cash",
                balance: 15000,
                color: theme.colors.mobileMoneyGreen,
            },
        ],
        // Banques européennes en EUR
        europeanBanks: {
            total: 4300,
            accounts: ["Crédit Agricole", "LCL", "BNP Paribas"],
        },
        // Carte virtuelle en EUR
        virtualCard: {
            balance: 1250.75,
            status: "active",
        },
    });

    // Calculer le total Mobile Money en FCFA
    const getTotalMobileMoneyFCFA = useCallback(() => {
        return balances.mobileMoneyAccounts.reduce(
            (sum, account) => sum + account.balance,
            0
        );
    }, [balances.mobileMoneyAccounts]);

    // Calculer le total en EUR (comptes uniquement : Mobile Money + banques européennes)
    // La carte virtuelle est considérée comme un portefeuille séparé.
    const getTotalEUR = useCallback(() => {
        const mobileMoneyEUR = getTotalMobileMoneyFCFA() / EXCHANGE_RATE;
        return mobileMoneyEUR + balances.europeanBanks.total;
    }, [balances.europeanBanks.total, getTotalMobileMoneyFCFA]);

    // Calculer l'équivalent total en FCFA pour les comptes (hors carte virtuelle)
    const getTotalFCFA = useCallback(() => {
        const totalEUR = getTotalEUR();
        return Math.round(totalEUR * EXCHANGE_RATE);
    }, [getTotalEUR]);

    // Recharger la carte virtuelle depuis le compte principal européen
    const rechargeVirtualCard = useCallback(
        (amount) => {
            // Vérifier si le solde du compte européen est suffisant
            if (balances.europeanBanks.total < amount) {
                Alert.alert(
                    "Solde insuffisant",
                    `Vous n'avez que ${balances.europeanBanks.total.toFixed(2)} € disponibles dans vos comptes européens.`
                );
                return false;
            }

            // Mettre à jour les soldes
            setBalances((prev) => ({
                ...prev,
                europeanBanks: {
                    ...prev.europeanBanks,
                    total: prev.europeanBanks.total - amount,
                },
                virtualCard: {
                    ...prev.virtualCard,
                    balance: prev.virtualCard.balance + amount,
                },
            }));

            Alert.alert(
                "Succès",
                `${amount.toFixed(2)} € ajoutés à votre carte virtuelle owo!\n\nNouveau solde carte: ${(balances.virtualCard.balance + amount).toFixed(2)} €\nSolde compte principal: ${(balances.europeanBanks.total - amount).toFixed(2)} €`
            );

            return true;
        },
        [balances]
    );

    // Retirer des fonds de la carte virtuelle vers le compte principal
    const withdrawFromVirtualCard = useCallback(
        (amount) => {
            if (balances.virtualCard.balance < amount) {
                Alert.alert(
                    "Solde insuffisant",
                    `Vous n'avez que ${balances.virtualCard.balance.toFixed(2)} € disponibles sur votre carte virtuelle.`
                );
                return false;
            }

            setBalances((prev) => ({
                ...prev,
                europeanBanks: {
                    ...prev.europeanBanks,
                    total: prev.europeanBanks.total + amount,
                },
                virtualCard: {
                    ...prev.virtualCard,
                    balance: prev.virtualCard.balance - amount,
                },
            }));

            return true;
        },
        [balances]
    );

    const value = {
        balances,
        getTotalMobileMoneyFCFA,
        getTotalEUR,
        getTotalFCFA,
        rechargeVirtualCard,
        withdrawFromVirtualCard,
        EXCHANGE_RATE,
    };

    return (
        <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
    );
}

export function useBalance() {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error("useBalance must be used within a BalanceProvider");
    }
    return context;
}
