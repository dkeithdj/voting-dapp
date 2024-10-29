import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Votingdapp } from "@/../anchor/target/types/votingdapp";

import IDL from "@/../anchor/target/idl/votingdapp.json";
import { BN, Program } from "@coral-xyz/anchor";

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://en.wikipedia.org/wiki/Peanut_butter#/media/File:PeanutButter.jpg",
    title: "Vote for your favorite peanut butter!",
    description: "Choose between smooth or crunchy peanut butter.",
    label: "Vote",
    links: {
      actions: [
        {
          type: "post",
          label: "Vote for Crunchy",
          href: "/api/vote?candidate=Crunchy",
        },
        {
          type: "post",
          label: "Vote for Smooth",
          href: "/api/vote?candidate=Smooth",
        },
      ],
    },
  };

  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "Smooth" && candidate != "Crunchy") {
    return new Response("Invalid candidate", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Votingdapp> = new Program(
    structuredClone(IDL) as Votingdapp,
    { connection },
  );
  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transaction,
    },
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
