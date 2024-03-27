import { describe, expect, it } from "vitest";
import { encodeFunctionData } from "viem";
import {
  array,
  bool,
  bytes4,
  fixedArray,
  fun,
  int32,
  Sink,
  struct,
  uint256,
} from "../src";

describe("Function", () => {
  it("encodes/decodes simple args", () => {
    const simpleFunction = fun("0x12345678", {
      foo: uint256,
      _1: int32,
      _2: bool,
    });
    const calldata = simpleFunction.encode({
      foo: 100n,
      _1: -420,
      _2: true,
    });
    expect(calldata).toBe(
      "0x123456780000000000000000000000000000000000000000000000000000000000000064fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe5c0000000000000000000000000000000000000000000000000000000000000001"
    );

    const decoded = simpleFunction.decode(calldata);
    expect(decoded).toStrictEqual({
      foo: 100n,
      _1: -420,
      _2: true,
    });
  });

  it("encodes/decodes dynamic args", () => {
    const staticStruct = struct({
      foo: uint256,
      bar: bytes4,
    });
    const dynamicFunction = fun("0x423917ce", {
      arg1: array(uint256),
      arg2: fixedArray(array(uint256), 10),
      arg3: struct({
        foo: uint256,
        bar: array(uint256),
        str: staticStruct,
      }),
      arg4: staticStruct,
    });
    const args = {
      arg1: [100n, 2n],
      arg2: [[], [1n], [], [], [100n, 2n, 3n], [], [], [1337n], [], []],
      arg3: {
        foo: 100n,
        bar: [1n, 2n, 3n],
        str: {
          foo: 123n,
          bar: Buffer.from([0x12, 0x34, 0x56, 0x78]),
        },
      },
      arg4: {
        foo: 100n,
        bar: Buffer.from([0x12, 0x34, 0x56, 0x78]),
      },
    };
    const viemArgs = [
      [100n, 2n],
      [[], [1n], [], [], [100n, 2n, 3n], [], [], [1337n], [], []],
      {
        foo: 100n,
        bar: [1n, 2n, 3n],
        str: {
          foo: 123n,
          bar: "0x12345678",
        },
      },
      {
        foo: 100n,
        bar: "0x12345678",
      },
    ] as const;

    const calldata = dynamicFunction.encode(args);
    const expected = encodeFunctionData({
      abi: [
        {
          name: "foo",
          type: "function",
          inputs: [
            { name: "arg1", type: "uint256[]" },
            { name: "arg2", type: "uint256[][10]" },
            {
              name: "arg3",
              type: "tuple",
              components: [
                { name: "foo", type: "uint256" },
                { name: "bar", type: "uint256[]" },
                {
                  name: "str",
                  type: "tuple",
                  components: [
                    { name: "foo", type: "uint256" },
                    { name: "bar", type: "bytes4" },
                  ],
                },
              ],
            },
            {
              name: "arg4",
              type: "tuple",
              components: [
                { name: "foo", type: "uint256" },
                { name: "bar", type: "bytes4" },
              ],
            },
          ],
        },
      ],
      functionName: "foo",
      args: viemArgs,
    });
    expect(calldata).toBe(expected);

    expect(dynamicFunction.decode(calldata)).toStrictEqual(args);
  });

  it("return simple type", () => {
    const simpleFunction = fun(
      "0x12345678",
      {
        foo: uint256,
      },
      int32
    );
    const sink = new Sink(1);
    int32.encode(sink, -420);
    sink.toString();
    const output = simpleFunction.decodeResult(sink.toString());
    expect(output).toBe(-420);
  });
});
