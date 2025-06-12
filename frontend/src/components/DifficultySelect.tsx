import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const difficultyOrder = ["A", "I", "S", "M", "N"] as const;
const difficultyLabels: Record<(typeof difficultyOrder)[number], string> = {
  A: "Advanced",
  I: "Intermediate",
  S: "Standard",
  M: "Medium",
  N: "Normal",
};

interface Props {
  quizDifficulty: (typeof difficultyOrder)[number];
  setQuizDifficulty: (difficulty: (typeof difficultyOrder)[number]) => void;
}

export default function DifficultySelect({
  quizDifficulty,
  setQuizDifficulty,
}: Props) {
  return (
    <div className="w-full mt-1">
      <Listbox value={quizDifficulty} onChange={setQuizDifficulty}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
            <span className="block truncate">
              {difficultyLabels[quizDifficulty]}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-indigo-500"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 top-full mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-indigo-700 shadow-lg ring-1 ring-gray-300 ring-opacity-50 focus:outline-none sm:text-sm">
              {difficultyOrder.map((key) => (
                <Listbox.Option
                  key={key}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-indigo-600 text-white" : "text-indigo-900"
                    }`
                  }
                  value={key}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {difficultyLabels[key]}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-indigo-600"
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
