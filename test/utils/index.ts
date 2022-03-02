import { Contract } from "ethers";
import { ethers } from "hardhat";

export async function setupUsers<T extends { [contractName: string]: Contract }>(
  addresses: string[],
  contracts: T
): Promise<({ address: string } & T)[]> {
  const users: ({ address: string } & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T
): Promise<{ address: string } & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address };
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }
  return user as { address: string } & T;
}

//  https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/rewrite/src/expect-revert.ts

export type Reason = string;

export async function expectRevert(txPromise: Promise<unknown>, reason?: Reason) {
  try {
    await txPromise;
    throw new Error("expected revert");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (!isRevert(err)) {
      throw new Error(`tx promise rejected but not due to revert (${err.message})`);
    }
    if (reason && !err.message.includes(reason)) {
      throw new Error(`tx reverted but for different reason (${err.message})`);
    }
    return err;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRevert(err: any) {
  const msg = err.message;
  if (typeof msg !== "string") return false;
  return [
    // Hardhat
    /transaction:? reverted/i,
    /transaction ran out of gas/i,

    // Truffle/Ganache
    /Transaction: 0x[0-9a-f]+ exited with an error/,
  ].some((p) => p.test(msg));
}

export function isLocal(envName: string) {
  return !!(
    {
      hardhat: true,
      localhost: true,
    } as Record<string, true>
  )[envName];
}
