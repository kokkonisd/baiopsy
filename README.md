# baiopsy

[Baiopsy](https://kokkonisd.github.io/baiopsy/) is a simple online tool that lets you see how your input changes shape
and size throughout your neural network.

## how to use baiopsy

In order to use baiopsy, you need to have a JSON file that describes the topology of your model. If you're working with
Keras, you can save your model in JSON form by using the following snippet:

```python
model_json = model.to_json()
with open("model.json", "w") as json_file:
    json_file.write(model_json)
```

You can then load it directly in [baiopsy](https://kokkonisd.github.io/baiopsy/).

## limitations

Baiopsy currently only supports models created in Keras and generated using the snippet shown in the previous section.

Furthermore, not all types of layers are supported. Here is a list of currently supported layers:

- Conv2D
- SeparableConv2D
- MaxPooling2D
- GlobalAveragePooling2D
- Flatten
- Dense

Finally, models that are based on other, pre-trained models (such as in transfer learning situations) are not currently
supported.
