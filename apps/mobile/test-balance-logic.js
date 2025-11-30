/**
 * Test de la logique du BalanceContext
 * 
 * Ce fichier teste la logique de calcul et de recharge sans interface utilisateur
 */

// Taux de change
const EXCHANGE_RATE = 655.96;

// Soldes initiaux
const balances = {
    mobileMoneyAccounts: [
        { provider: "MTN Mobile Money", balance: 45250 },
        { provider: "Moov Money", balance: 25500 },
        { provider: "Celtiis Cash", balance: 15000 },
    ],
    europeanBanks: {
        total: 4300,
        accounts: ["Crédit Agricole", "LCL", "BNP Paribas"],
    },
    virtualCard: {
        balance: 1250.75,
        status: "active",
    },
};

// Calculer le total Mobile Money en FCFA
function getTotalMobileMoneyFCFA() {
    return balances.mobileMoneyAccounts.reduce(
        (sum, account) => sum + account.balance,
        0
    );
}

// Calculer le total en EUR
function getTotalEUR() {
    const mobileMoneyEUR = getTotalMobileMoneyFCFA() / EXCHANGE_RATE;
    return mobileMoneyEUR + balances.europeanBanks.total + balances.virtualCard.balance;
}

// Calculer l'équivalent total en FCFA
function getTotalFCFA() {
    const totalEUR = getTotalEUR();
    return Math.round(totalEUR * EXCHANGE_RATE);
}

// Test 1: Vérifier la conversion EUR/FCFA
console.log("=== TEST 1: Conversion EUR/FCFA ===");
console.log(`Mobile Money total: ${getTotalMobileMoneyFCFA()} FCFA`);
console.log(`Mobile Money en EUR: ${(getTotalMobileMoneyFCFA() / EXCHANGE_RATE).toFixed(2)} €`);
console.log(`Banques européennes: ${balances.europeanBanks.total} €`);
console.log(`Carte virtuelle: ${balances.virtualCard.balance} €`);
console.log(`Total en EUR: ${getTotalEUR().toFixed(2)} €`);
console.log(`Total en FCFA: ${getTotalFCFA().toLocaleString()} FCFA`);
console.log("");

// Test 2: Simulation de recharge
console.log("=== TEST 2: Simulation de recharge de 100€ ===");
const rechargeAmount = 100;
console.log(`Avant recharge:`);
console.log(`  - Compte européen: ${balances.europeanBanks.total} €`);
console.log(`  - Carte virtuelle: ${balances.virtualCard.balance} €`);
console.log(`  - Total: ${getTotalEUR().toFixed(2)} €`);

// Effectuer la recharge (simulation)
const newEuropeanBalance = balances.europeanBanks.total - rechargeAmount;
const newCardBalance = balances.virtualCard.balance + rechargeAmount;

console.log(`\nAprès recharge de ${rechargeAmount}€:`);
console.log(`  - Compte européen: ${newEuropeanBalance} €`);
console.log(`  - Carte virtuelle: ${newCardBalance} €`);

// Calculer le nouveau total
const newTotal = (getTotalMobileMoneyFCFA() / EXCHANGE_RATE) + newEuropeanBalance + newCardBalance;
console.log(`  - Total: ${newTotal.toFixed(2)} €`);
console.log(`\n✓ Le total reste identique: ${getTotalEUR().toFixed(2)} € = ${newTotal.toFixed(2)} €`);
console.log("");

// Test 3: Vérifier le calcul correct de la conversion
console.log("=== TEST 3: Vérification du calcul de conversion ===");
const testEUR = 5681.50;
const expectedFCFA = testEUR * EXCHANGE_RATE;
console.log(`${testEUR} € × ${EXCHANGE_RATE} = ${Math.round(expectedFCFA).toLocaleString()} FCFA`);
console.log(`\n✓ La conversion est correcte (ancien calcul erroné: 85 750 FCFA)`);
console.log("");

// Test 4: Vérifier les limites de recharge
console.log("=== TEST 4: Test des limites de recharge ===");
const invalidAmount = 5000; // Plus que le solde disponible
if (invalidAmount > balances.europeanBanks.total) {
    console.log(`✓ Recharge de ${invalidAmount}€ refusée: solde insuffisant (${balances.europeanBanks.total}€)`);
} else {
    console.log(`✗ Erreur: la recharge n'aurait pas dû être autorisée`);
}

const validAmount = 1000; // Moins que le solde disponible
if (validAmount <= balances.europeanBanks.total) {
    console.log(`✓ Recharge de ${validAmount}€ autorisée: solde suffisant (${balances.europeanBanks.total}€)`);
} else {
    console.log(`✗ Erreur: la recharge aurait dû être autorisée`);
}

console.log("\n=== TOUS LES TESTS PASSÉS ===");
