from setuptools import setup

setup(
    name="llm-epoch-example",
    version="0.1.0",
    description="Example tools for Epoch LLM CLI integration",
    author="Epoch Team",
    py_modules=["llm_epoch_example"],
    install_requires=["llm>=0.13", "requests"],
    entry_points={
        "llm": [
            "epoch_example = llm_epoch_example:register_tools"
        ]
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
