pragma circom 2.1.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";

template AgeVerification() {
    // Public Input: The threshold date (e.g., 18 years from now)
    signal input verificationThreshold;
    // Private Input: The user's actual date of birth (as a timestamp)
    signal input dateOfBirth;
    // Public Output: 1 if over age, 0 otherwise
    signal output isOverAge;

    // Calculate if DOB is less than (before) the threshold
    component lt = LessThan(32); // Compare two 32-bit numbers
    lt.in[0] <== dateOfBirth;
    lt.in[1] <== verificationThreshold;

    // isOverAge = 1 if dateOfBirth < verificationThreshold (born before the threshold)
    // We also need to ensure the user isn't providing a date in the far future, etc.
    // Additional logic for sanity checks can be added here.

    isOverAge <== lt.out;

    // Optional: Hash the DOB to create a unique identifier without revealing it
    component hash = Poseidon(1);
    hash.inputs[0] <== dateOfBirth;
    // This hash could be stored on-chain to prevent double-using the same proof
    // signal output dobHash <== hash.out;
}

component main = AgeVerification();
