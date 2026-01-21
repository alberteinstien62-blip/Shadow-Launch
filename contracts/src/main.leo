// ShadowLaunch - Private Token Launchpad on Aleo
// Version: 1.0.0
// "Fair launches. No snipers. No bots."
// Updated for Leo 3.4+ async/await model

program shadowlaunch_v2.aleo {

    // ========================================
    // CONSTRUCTOR (Required for deployment)
    // ========================================

    @noupgrade
    async constructor() {
        // Program is immutable once deployed
    }

    // ========================================
    // RECORDS (Private State)
    // ========================================

    // Commitment record (user holds during commit phase)
    record Commitment {
        owner: address,
        launch_id: field,
        amount: u64,
        secret: field,
        committed_at: u32,
    }

    // Allocation record (user receives after reveal)
    record TokenAllocation {
        owner: address,
        launch_id: field,
        tokens_allocated: u64,
        amount_paid: u64,
        refund_amount: u64,
        revealed: bool,
    }

    // Launch admin record
    record LaunchAdmin {
        owner: address,
        launch_id: field,
        token_symbol: field,
        total_supply: u64,
        price_per_token: u64,
    }

    // ========================================
    // MAPPINGS (Public State)
    // ========================================

    // launch_id -> phase (0=pending, 1=commit, 2=reveal, 3=distribute, 4=ended)
    mapping launch_phase: field => u8;

    // launch_id -> total_supply for sale
    mapping launch_supply: field => u64;

    // launch_id -> price per token (in microcredits)
    mapping launch_price: field => u64;

    // launch_id -> commit end block
    mapping commit_end_block: field => u32;

    // launch_id -> reveal end block
    mapping reveal_end_block: field => u32;

    // launch_id -> total committed amount (updated after reveals)
    mapping total_committed: field => u64;

    // launch_id -> total participants
    mapping participant_count: field => u32;

    // commitment_hash -> has_committed
    mapping commitments: field => bool;

    // reveal_hash (launch_id + user) -> has_revealed
    mapping reveals: field => bool;

    // launch_id -> total_revealed_amount
    mapping total_revealed: field => u64;

    // ========================================
    // TRANSITIONS
    // ========================================

    // Create a new token launch
    // Called by: Project admin
    async transition create_launch(
        launch_id: field,
        token_symbol: field,
        total_supply: u64,
        price_per_token: u64,
        commit_duration_blocks: u32,
        reveal_duration_blocks: u32
    ) -> (LaunchAdmin, Future) {
        assert(total_supply > 0u64);
        assert(price_per_token > 0u64);
        assert(commit_duration_blocks > 0u32);
        assert(reveal_duration_blocks > 0u32);

        let admin: LaunchAdmin = LaunchAdmin {
            owner: self.caller,
            launch_id: launch_id,
            token_symbol: token_symbol,
            total_supply: total_supply,
            price_per_token: price_per_token,
        };

        return (admin, finalize_create_launch(
            launch_id,
            total_supply,
            price_per_token,
            commit_duration_blocks,
            reveal_duration_blocks
        ));
    }

    async function finalize_create_launch(
        launch_id: field,
        total_supply: u64,
        price_per_token: u64,
        commit_duration: u32,
        reveal_duration: u32
    ) {
        // Ensure launch doesn't exist
        let exists: bool = launch_phase.contains(launch_id);
        assert(!exists);

        // Calculate end blocks based on current block height
        let current_block: u32 = block.height;
        let commit_end: u32 = current_block + commit_duration;
        let reveal_end: u32 = commit_end + reveal_duration;

        // Set launch parameters
        launch_phase.set(launch_id, 1u8); // Start in commit phase
        launch_supply.set(launch_id, total_supply);
        launch_price.set(launch_id, price_per_token);
        commit_end_block.set(launch_id, commit_end);
        reveal_end_block.set(launch_id, reveal_end);
        total_committed.set(launch_id, 0u64);
        participant_count.set(launch_id, 0u32);
        total_revealed.set(launch_id, 0u64);
    }

    // Commit to purchase (Phase 1)
    // Amount and identity hidden until reveal
    // Called by: Buyer
    async transition commit(
        launch_id: field,
        amount: u64,
        secret: field
    ) -> (Commitment, Future) {
        assert(amount > 0u64);

        // Compute commitment hash
        let addr_hash: field = BHP256::hash_to_field(self.caller);
        let commitment_hash: field = BHP256::hash_to_field(
            addr_hash + amount as field + secret
        );

        let commitment_record: Commitment = Commitment {
            owner: self.caller,
            launch_id: launch_id,
            amount: amount,
            secret: secret,
            committed_at: 0u32,
        };

        return (commitment_record, finalize_commit(launch_id, commitment_hash));
    }

    async function finalize_commit(launch_id: field, commitment_hash: field) {
        // Verify in commit phase
        let phase: u8 = launch_phase.get(launch_id);
        assert_eq(phase, 1u8);

        // Verify commit phase hasn't ended (block height check)
        let commit_end: u32 = commit_end_block.get(launch_id);
        assert(block.height <= commit_end);

        // Verify not already committed (this exact commitment)
        let already_committed: bool = commitments.get_or_use(commitment_hash, false);
        assert(!already_committed);

        // Store commitment
        commitments.set(commitment_hash, true);

        // Increment participant count
        let count: u32 = participant_count.get(launch_id);
        participant_count.set(launch_id, count + 1u32);
    }

    // Reveal commitment (Phase 2)
    // Called by: Committer
    async transition reveal(
        commitment_input: Commitment
    ) -> (TokenAllocation, Future) {
        // Recompute commitment hash for verification
        let addr_hash: field = BHP256::hash_to_field(commitment_input.owner);
        let commitment_hash: field = BHP256::hash_to_field(
            addr_hash + commitment_input.amount as field + commitment_input.secret
        );

        // Compute reveal hash
        let reveal_hash: field = BHP256::hash_to_field(
            commitment_input.launch_id + addr_hash
        );

        let allocation: TokenAllocation = TokenAllocation {
            owner: commitment_input.owner,
            launch_id: commitment_input.launch_id,
            tokens_allocated: 0u64,  // Will be calculated later
            amount_paid: commitment_input.amount,
            refund_amount: 0u64,
            revealed: true,
        };

        return (allocation, finalize_reveal(
            commitment_input.launch_id,
            commitment_hash,
            reveal_hash,
            commitment_input.amount
        ));
    }

    async function finalize_reveal(
        launch_id: field,
        commitment_hash: field,
        reveal_hash: field,
        amount: u64
    ) {
        // Verify timing: must be after commit phase ends and before reveal ends
        let commit_end: u32 = commit_end_block.get(launch_id);
        let reveal_end: u32 = reveal_end_block.get(launch_id);
        assert(block.height > commit_end);   // Commit phase must have ended
        assert(block.height <= reveal_end);  // Reveal phase must still be active

        // Update phase to reveal if still in commit
        let current_phase: u8 = launch_phase.get(launch_id);
        let new_phase: u8 = current_phase == 1u8 ? 2u8 : current_phase;
        assert(new_phase == 2u8); // Must be in reveal phase
        launch_phase.set(launch_id, new_phase);

        // Verify commitment exists
        let commitment_exists: bool = commitments.get(commitment_hash);
        assert(commitment_exists);

        // Verify not already revealed
        let already_revealed: bool = reveals.get_or_use(reveal_hash, false);
        assert(!already_revealed);

        // Mark as revealed
        reveals.set(reveal_hash, true);

        // Add to total revealed (with overflow check)
        let current_total: u64 = total_revealed.get(launch_id);
        let new_total: u64 = current_total + amount;
        assert(new_total >= current_total); // Overflow check
        total_revealed.set(launch_id, new_total);
    }

    // End reveal phase and start distribution
    // Called by: Anyone (after reveal ends)
    async transition end_reveal_phase(
        launch_id: field
    ) -> Future {
        return finalize_end_reveal_phase(launch_id);
    }

    async function finalize_end_reveal_phase(launch_id: field) {
        // Verify reveal phase has ended (block height check)
        let reveal_end: u32 = reveal_end_block.get(launch_id);
        assert(block.height > reveal_end);

        // Update to distribution phase
        let current_phase: u8 = launch_phase.get(launch_id);
        assert(current_phase == 2u8); // Must be in reveal phase
        launch_phase.set(launch_id, 3u8);
    }

    // End launch
    // Called by: Admin
    async transition end_launch(
        admin: LaunchAdmin
    ) -> (LaunchAdmin, Future) {
        assert_eq(admin.owner, self.caller);

        let updated_admin: LaunchAdmin = LaunchAdmin {
            owner: admin.owner,
            launch_id: admin.launch_id,
            token_symbol: admin.token_symbol,
            total_supply: admin.total_supply,
            price_per_token: admin.price_per_token,
        };

        return (updated_admin, finalize_end_launch(admin.launch_id));
    }

    async function finalize_end_launch(launch_id: field) {
        launch_phase.set(launch_id, 4u8);
    }
}
