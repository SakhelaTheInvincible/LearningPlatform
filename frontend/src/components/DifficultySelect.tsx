import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";

const difficultyOrder = ["A", "I", "S", "M", "N"] as const;
const difficultyLabels: Record<(typeof difficultyOrder)[number], string> = {
  A: "Advanced",
  I: "Intermediate", 
  S: "Standard",
  M: "Medium",
  N: "Normal",
};

const difficultyColors: Record<(typeof difficultyOrder)[number], string> = {
  A: "from-red-500 to-pink-500",
  I: "from-yellow-500 to-orange-500",
  S: "from-blue-500 to-cyan-500",
  M: "from-green-500 to-emerald-500",
  N: "from-gray-500 to-gray-600",
};

const difficultyDescriptions: Record<(typeof difficultyOrder)[number], string> = {
  A: "Challenging questions for experts",
  I: "Moderate difficulty level",
  S: "Balanced difficulty for most users",
  M: "Slightly easier than standard",
  N: "Basic level questions",
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
    <div className="w-full">
      <Listbox value={quizDifficulty} onChange={setQuizDifficulty}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm py-3 pl-4 pr-12 text-left shadow-lg hover:border-indigo-300 hover:bg-white/90 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 group">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${difficultyColors[quizDifficulty]} shadow-lg`}></div>
              <div>
                <span className="block text-sm font-semibold text-gray-900">
                  {difficultyLabels[quizDifficulty]}
                </span>
                <span className="block text-xs text-gray-500">
                  {difficultyDescriptions[quizDifficulty]}
                </span>
              </div>
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Listbox.Options className="absolute z-50 top-full mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white/95 backdrop-blur-lg py-2 shadow-2xl ring-1 ring-white/20 border border-gray-200 focus:outline-none">
              {difficultyOrder.map((key, index) => (
                <Listbox.Option
                  key={key}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-4 pr-12 mx-2 rounded-lg transition-all duration-150 ${
                      active 
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 shadow-md" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                  value={key}
                >
                  {({ selected, active }) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${difficultyColors[key]} shadow-lg`}></div>
                      <div className="flex-1">
                        <span
                          className={`block text-sm font-medium ${
                            selected ? "font-semibold text-indigo-900" : ""
                          }`}
                        >
                          {difficultyLabels[key]}
                        </span>
                        <span className={`block text-xs ${
                          active ? "text-indigo-600" : "text-gray-500"
                        }`}>
                          {difficultyDescriptions[key]}
                        </span>
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center"
                        >
                          <div className="p-1 bg-indigo-100 rounded-full">
                            <CheckIcon 
                              className="h-4 w-4 text-indigo-600" 
                              aria-hidden="true" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
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
