// Leo program for private degree verification
// This circuit proves that a user has a valid degree without revealing personal information

program degree_verification.aleo {
    // Structure for hashed diploma data
    struct HashedDiploma {
        degree_hash: field,
        school_hash: field,
        date_hash: field,
        student_id_hash: field,
        gpa_hash: field,
    }

    // Structure for the issuer's signature
    struct IssuerSignature {
        signature_r: field,
        signature_s: field,
        public_key_x: field,
        public_key_y: field,
    }

    // Public inputs that can be verified by anyone
    struct PublicInputs {
        issuer_public_key_hash: field,
        verification_timestamp: u64,
        degree_type_commitment: field, // Commitment to degree type without revealing it
    }

    // Main verification function
    transition verify_degree(
        // Private inputs (only known to the prover)
        private degree: field,
        private school: field,
        private graduation_date: field,
        private student_id: field,
        private gpa: field,
        private signature: IssuerSignature,
        
        // Public inputs (visible to verifier)
        public issuer_public_key_hash: field,
        public verification_timestamp: u64,
        public minimum_gpa_threshold: field,
    ) -> PublicInputs {
        
        // Hash the private inputs to create the diploma data structure
        let hashed_diploma: HashedDiploma = HashedDiploma {
            degree_hash: Poseidon2::hash_to_field([degree]),
            school_hash: Poseidon2::hash_to_field([school]),
            date_hash: Poseidon2::hash_to_field([graduation_date]),
            student_id_hash: Poseidon2::hash_to_field([student_id]),
            gpa_hash: Poseidon2::hash_to_field([gpa]),
        };

        // Create the message that was signed by the issuer
        let message_hash: field = Poseidon4::hash_to_field([
            hashed_diploma.degree_hash,
            hashed_diploma.school_hash,
            hashed_diploma.date_hash,
            hashed_diploma.student_id_hash,
        ]);

        // Verify the issuer's signature on the hashed diploma data
        let is_signature_valid: bool = signature_verification(
            message_hash,
            signature,
            issuer_public_key_hash
        );
        assert(is_signature_valid);

        // Verify that the GPA meets the minimum threshold (if specified)
        let meets_gpa_requirement: bool = (minimum_gpa_threshold == 0field) || (gpa >= minimum_gpa_threshold);
        assert(meets_gpa_requirement);

        // Create a commitment to the degree type without revealing it
        let degree_type_commitment: field = Poseidon2::hash_to_field([
            degree,
            verification_timestamp as field,
        ]);

        // Return public outputs that can be verified
        return PublicInputs {
            issuer_public_key_hash,
            verification_timestamp,
            degree_type_commitment,
        };
    }

    // Helper function to verify ECDSA signature
    function signature_verification(
        message: field,
        signature: IssuerSignature,
        public_key_hash: field,
    ) -> bool {
        // Reconstruct public key hash from coordinates
        let reconstructed_key_hash: field = Poseidon2::hash_to_field([
            signature.public_key_x,
            signature.public_key_y,
        ]);
        
        // Verify that the public key hash matches
        let key_hash_valid: bool = (reconstructed_key_hash == public_key_hash);
        
        // Verify ECDSA signature (simplified verification)
        // In a real implementation, this would use proper ECDSA verification
        let signature_hash: field = Poseidon4::hash_to_field([
            message,
            signature.signature_r,
            signature.signature_s,
            signature.public_key_x,
        ]);
        
        let expected_signature_hash: field = Poseidon2::hash_to_field([
            signature.public_key_y,
            message,
        ]);
        
        let signature_valid: bool = (signature_hash == expected_signature_hash);
        
        return key_hash_valid && signature_valid;
    }

    // Transition for batch verification of multiple degrees
    transition batch_verify_degrees(
        private degrees: [field; 4],
        private schools: [field; 4],
        private graduation_dates: [field; 4],
        private student_ids: [field; 4],
        private signatures: [IssuerSignature; 4],
        public issuer_public_key_hash: field,
        public verification_timestamp: u64,
    ) -> field {
        let mut all_valid: bool = true;
        let mut verification_hash: field = 0field;
        
        for i in 0u8..4u8 {
            let hashed_diploma: HashedDiploma = HashedDiploma {
                degree_hash: Poseidon2::hash_to_field([degrees[i]]),
                school_hash: Poseidon2::hash_to_field([schools[i]]),
                date_hash: Poseidon2::hash_to_field([graduation_dates[i]]),
                student_id_hash: Poseidon2::hash_to_field([student_ids[i]]),
                gpa_hash: 0field, // Not used in batch verification
            };
            
            let message_hash: field = Poseidon4::hash_to_field([
                hashed_diploma.degree_hash,
                hashed_diploma.school_hash,
                hashed_diploma.date_hash,
                hashed_diploma.student_id_hash,
            ]);
            
            let is_valid: bool = signature_verification(
                message_hash,
                signatures[i],
                issuer_public_key_hash
            );
            
            all_valid = all_valid && is_valid;
            
            // Accumulate verification hash
            verification_hash = Poseidon2::hash_to_field([
                verification_hash,
                message_hash,
            ]);
        }
        
        assert(all_valid);
        
        return verification_hash;
    }

    // Transition to prove minimum GPA without revealing exact value
    transition prove_min_gpa(
        private actual_gpa: field,
        private salt: field,
        public minimum_required_gpa: field,
        public gpa_commitment: field,
    ) -> bool {
        // Verify that the committed GPA matches the private input
        let expected_commitment: field = Poseidon2::hash_to_field([
            actual_gpa,
            salt,
        ]);
        assert(gpa_commitment == expected_commitment);
        
        // Verify that the actual GPA meets the minimum requirement
        let meets_requirement: bool = actual_gpa >= minimum_required_gpa;
        assert(meets_requirement);
        
        return true;
    }

    // Transition to prove graduation within a date range
    transition prove_graduation_date_range(
        private graduation_date: field,
        private salt: field,
        public min_date: field,
        public max_date: field,
        public date_commitment: field,
    ) -> bool {
        // Verify that the committed date matches the private input
        let expected_commitment: field = Poseidon2::hash_to_field([
            graduation_date,
            salt,
        ]);
        assert(date_commitment == expected_commitment);
        
        // Verify that the graduation date is within the specified range
        let after_min: bool = graduation_date >= min_date;
        let before_max: bool = graduation_date <= max_date;
        assert(after_min && before_max);
        
        return true;
    }
}
