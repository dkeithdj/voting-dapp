import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Votingdapp } from "../target/types/votingdapp";

import { startAnchor } from "solana-bankrun";
import IDL from "../target/idl/votingdapp.json";
import { BankrunProvider } from "anchor-bankrun";

const votingAddress = new PublicKey(
  "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
);

describe("votingdapp", () => {
  it("Initialize Voting", async () => {
    const context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      [],
    );
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Votingdapp>(IDL as anchor.Idl, provider);

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "What is your favorite type of peanut butter",
        new anchor.BN(0),
        new anchor.BN(1829016955),
      )
      .rpc();
  });
});
