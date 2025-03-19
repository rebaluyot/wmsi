import { useState, useEffect, useRef } from "react";
import { View, Text, Alert, Keyboard } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Appbar,
  DataTable,
  IconButton,
  Portal,
  Snackbar,
  TextInput,
  Button,
  ActivityIndicator,
  MD2Colors,
  Divider,
  Dialog,
} from "react-native-paper";
import * as SQLite from "expo-sqlite";
import axios from "axios";
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";

const EditItemComponent = ({ data, visible, onClose, onDelete, onSave }) => {
  const [editQty, setEditQty] = useState(data.qty);

  const confirmDelete = () => {
    //console.log('test')
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Confirmation",
      "Please confirm you action",
      [
        {
          text: "No",
          onPress: () => onClose(),
        },
        {
          text: "Yes",
          onPress: () => onDelete(data.id),
        },
      ],
      { cancelable: true }
    );
    //onDelete(data.id )
    onClose();
  };

  const handleEdit = () => {
    if (/^\d+$/.test(editQty) || editQty === "") {
      if (editQty != "") {
        onSave(data.id, editQty);
      }
      onClose();
      setEditQty("");
    } else {
      setEditQty(data.qty);
      Alert.alert("Invalid Input", "Please enter numeric values only.");
    }
  };

  return (
    <View className="w-full mx-5">
      <Portal>
        <Dialog visible={visible} onDismiss={onClose}>
          <Dialog.Title>{`Item Detail: ${data.id}`}</Dialog.Title>
          <Dialog.Content>
            <Text className="font-bold">{`Part: ${data.part}`}</Text>
            <Text className="font-semibold">{`Desc: ${data.name}`}</Text>
            <TextInput
              onChangeText={setEditQty}
              defaultValue={data.qty}
              onSubmitEditing={handleEdit}
              className="w-4/6 p-1"
              keyboardType="numeric"
              label={"QTY:"}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onClose}>Cancel</Button>
            <Button onPress={handleEdit}>Save</Button>
            <Button onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const PrintReceipt = ({ data, visible, onClose }) => {
  const [reference, setReference] = useState("");
  const currentDateTime = new Date().toLocaleString();
  const handlePrintReciept = async () => {
    console.log(`printing: ${reference}`);
    try {
      await BluetoothEscposPrinter.printerInit();
      await BluetoothEscposPrinter.printerLeftSpace(0);
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printText(" WMS Module\r\n", {
        align: "center",
      });
      await BluetoothEscposPrinter.printText(
        `${data.length} SCANNED ITEMS\r\n\r\n`,
        {}
      );
      await BluetoothEscposPrinter.printText(
        `Reference# : ${reference}\r\n`,
        {}
      );
      await BluetoothEscposPrinter.printText(
        `Date Time# : ${currentDateTime}\r\n`,
        {}
      );
      await BluetoothEscposPrinter.printText(
        "--------------------------------\r\n",
        {}
      );
      let columnWidths = [12, 12, 6];
      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["PART#", "NAME", "QTY"],
        {}
      );
      let qtyTotal = 0;
      for (let i = 0; i < data.length; i++) {
        let part = data[i]?.part ? data[i]?.part : "";
        let name = data[i]?.name ? data[i]?.name : "";
        let qty = data[i]?.qty ? data[i]?.qty.toString() : "0";
        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          [part, name, qty],
          {}
        );
        qtyTotal = qtyTotal + parseInt(data[i].qty);
      }
      let total = qtyTotal ? qtyTotal.toString() : "0";
      await BluetoothEscposPrinter.printText(
        "--------------------------------\r\n",
        {}
      );
      await BluetoothEscposPrinter.printColumn(
        [18, 12],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ["TOTAL", total],
        {}
      );

      await BluetoothEscposPrinter.printText("\r\n", {});
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );
      await BluetoothEscposPrinter.printQRCode(
        reference.toUpperCase(),
        150,
        BluetoothEscposPrinter.ERROR_CORRECTION.L
      ); //.then(()=>{alert('done')},(err)=>{alert(err)});
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
      );
      await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {});
    } catch (e) {
      alert(e.message || "ERROR");
    } finally {
      //setReference("");
      onClose();
    }
  };
  return (
    <View className="w-full mx-5">
      <Portal>
        <Dialog visible={visible} onDismiss={onClose}>
          <Dialog.Title>{`Confirmation`}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              onChangeText={setReference}
              defaultValue={reference}
              className="w-full"
              label={"Inbound Reference:"}
              keyboardType="default"
              mode="outlined"
            />
            <Text className="font-bold">
              This will print scanned items receipt...
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onClose}>Cancel</Button>
            <Button onPress={handlePrintReciept}>Print</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const PostInbound = ({ visible, onClose, onConfirm }) => {
  // sending data to api for posting
  const [caseReference, setCaseReference] = useState("");
  const [reference, setReference] = useState("");
  const handleConfirm = () => {
    if (reference != "" && caseReference != "") {
      onConfirm(reference.toUpperCase(), caseReference.toUpperCase());
      setReference("");
      setCaseReference("");
      onClose();
    }
  };
  return (
    <View className="w-full mx-5">
      <Portal>
        <Dialog visible={visible} onDismiss={onClose}>
          <Dialog.Title>{`Confirmation`}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              onChangeText={setReference}
              defaultValue={reference}
              className="w-full"
              label={"Inbound Reference:"}
              keyboardType="default"
              mode='outlined'
            />
            <TextInput
              onChangeText={setCaseReference}
              defaultValue={caseReference}
              className="w-full"
              label={"BATCH/LOT:"}
              keyboardType="default"
              mode='outlined'
            />
            <Text className="font-bold">
              This will send scanned items to WMS...
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onClose}>Cancel</Button>
            <Button onPress={handleConfirm}>Send</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const MessageBar = ({ message, visible, onClose }) => {
  return (
    <View className="w-full mx-5">
      <Snackbar
        visible={visible}
        onDismiss={onClose}
        action={{
          label: "Undo",
          onPress: () => {
            onClose;
          },
        }}
      >
        {message}
      </Snackbar>
    </View>
  );
};

const Inbound = ({ navigation }) => {
  const searchInput = useRef(null);
  const [page, setPage] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [isChanging, setIsChanging] = useState(null);
  //const [db, setDb] = useState(SQLite.openDatabase('iwms.db'));
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(undefined);
  const [foundItem, setFoundItem] = useState(null);
  const db = SQLite.openDatabase("iwms.db");

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, items.length);

  const [visibleEdit, setVisibleEdit] = useState(false);
  const [dataEdit, setDataEdit] = useState({});
  const [visible, setVisible] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [visibleSnack, setVisibleSnack] = useState(false);
  const [storedData, setStoredData] = useState({
    company: "",
    account: "",
    baseurl: "",
  });

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const showPostDialog = () => setPostVisible(true);
  const hidePostDialog = () => setPostVisible(false);

  const showSnack = () => setVisibleSnack(true);
  const hideSnack = () => setVisibleSnack(false);

  const containerStyle = { backgroundColor: "white", padding: 20 };

  const [qty, setQty] = useState(0);

  const retrieveStorage = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      setMessage("Error getting settings.");
      showSnack();
    }
  };

  const fetchItem = async (itemNo) => {
    const urlBase = storedData?.baseurl
      ? storedData.baseurl
      : `http://192.168.1.8:5000`;
    const myAxiosInstance = axios.create({
      baseURL: urlBase,
      timeout: 5000, // set a timeout value
      // other configurations...
    });

    //const urlBase = storedData?.baseurl ? `${storedData?.baseurl}?id=${itemNo}` : `http://192.168.1.8:5000/api/wms?id=${itemNo}`
    //console.log(urlBase);
    try {
      // Adjust the API endpoint and parameters based on your API
      const response = await myAxiosInstance.get(`/api/wms?id=${itemNo}`);
      if (response?.data?.short_description) {
        return response?.data?.short_description;
      } else {
        setMessage(`Part# not found ${itemNo}`);
        showSnack();
        return "<New Part No>";
      }
    } catch (error) {
      setMessage("Error fetching data.");
      showSnack();
      console.error("Error fetching data:", error);
      return "<New Part No>";
    }
  };

  const sendItem = async (data) => {
    const urlBase = storedData?.baseurl
      ? storedData.baseurl
      : `http://192.168.1.8:5000`;
    const myAxiosInstance = axios.create({
      baseURL: urlBase,
      timeout: 5000,
    });

    //console.log(urlBase);
    try {
      // Adjust the API endpoint and parameters based on your API
      const response = await myAxiosInstance.post(`/api/send_inbound`, {
        data: data,
      });
      //console.log(response?.data?.message);
      if (response?.data?.message) {
        setMessage(`Message: ${response?.data?.message}`);
        showSnack();
        return true;
      } else {
        setMessage(`Failed to send items.`);
        showSnack();
        return false;
      }
    } catch (error) {
      setMessage("Error sending data.");
      showSnack();
      console.error("Error sending data:", error);
      return false;
    }
  };

  const handleEditActionIconPress = (item) => {
    setDataEdit({
      id: item.id,
      part: item.part,
      name: item.name,
      qty: item.qty.toString(),
    });
    setVisibleEdit(true);
  };

  const handleCloseActionIconPress = () => {
    setDataEdit({});
    setVisibleEdit(false);
  };

  const handleDelete = (id) => {
    //console.log(`deleting .. ${id}`);
    deleteItem(id);
  };

  const handleEdit = (id, qty) => {
    //console.log(`Editing .. ${id}`);
    setQty(parseInt(qty, 10));
  };

  const handleNew = () => {
    const stringArray = searchQuery.split(" ");
    const itemPartNo = stringArray[0];
    const foundIndex = items.findIndex((item) => item.part === itemPartNo);
    setSearchQuery("");
    if (foundIndex !== -1) {
      //console.log("update");
      let qtyNew = items[foundIndex].qty + 1;
      updateItem(items[foundIndex].id, qtyNew);
      setIsChanging(
        items[foundIndex].id === isChanging ? -1 : items[foundIndex].id
      );
    } else {
      //console.log("insert");
      setFoundItem(null);
      setCurrentItem(itemPartNo);
      addItem(itemPartNo);
      setIsChanging(Math.random());
    }
  };

  const handleSend = (inboundReference, caseReference) => {
    const data = {
      company: storedData.company,
      account: storedData.account,
      inboundReference: inboundReference,
      caseReference: caseReference,
      items: items,
    };
    if (sendItem(data)) {
      deleteAllItems();
    };
  };

  const addItem = async (itemNo) => {
    if (itemNo && itemNo.length > 0) {
      const partName = await fetchItem(itemNo);
      //console.log(partName)
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO scanned (part, name, qty) values (?, ?, ?)",
          [itemNo, partName, 1],
          (txObj, resultSet) => {
            let existingItems = [...items];
            existingItems.push({
              id: resultSet.insertId,
              part: itemNo,
              name: partName,
              qty: 1,
            });
            setItems(existingItems);
            setCurrentItem(undefined);
          },
          (txObj, error) => console.log(error)
        );
      });
      setIsChanging(Math.random());
    }
  };

  const updateItem = (id, qty) => {
    //console.log(`item: ${id} qty: ${qty}`);
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE scanned SET qty = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [qty, id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingItems = [...items];
            const indexToUpdate = existingItems.findIndex(
              (item) => item.id === id
            );
            existingItems[indexToUpdate].item = currentItem;
            setItems(existingItems);
            setCurrentItem(undefined);
          }
        },
        (txObj, error) => console.log(error)
      );
    });
    setIsChanging(Math.random());
  };

  const deleteItem = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM scanned WHERE id = ?",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingItems = [...items].filter((item) => item.id !== id);
            setItems(existingItems);
          }
        },
        (txObj, error) => console.log(error)
      );
    });
    setIsChanging(id);
  };

  const deleteAllItems = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM scanned",
        null,
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingItems = [];
            setItems(existingItems);
            setMessage("Reset complete.");
            showSnack();
          }
        },
        (txObj, error) => console.log(error)
      );
    });
    setIsChanging(null);
  };

  useEffect(() => {
    setPage(0);
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS scanned 
          (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              part TEXT, 
              name TEXT, 
              qty INTEGER,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
          `
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM scanned order by updatedAt desc, id desc",
        null,
        (txObj, resultSet) => {
          setItems(resultSet.rows._array);
          //console.log(resultSet.rows._array.length);
        },
        (txObj, error) => console.log(error)
      );
    });
    setIsLoadingDb(false);
    if (searchInput.current) {
      searchInput.current.focus();
    }
  }, [isChanging]);

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  useEffect(() => {
    if (searchInput.current) {
      searchInput.current.focus();
    }
  }, [db]);

  useEffect(() => {
    const setdata = async () => {
      const setdata = await retrieveStorage("userData");
      if (setdata) {
        setStoredData({
          company: setdata.company,
          account: setdata.account,
          baseurl: setdata.baseurl,
        });
      }
      //console.log(setdata)
    };
    setdata();
  }, []);

  if (isLoadingDb) {
    return (
      <View className="flex justify-center h-full w-full items-center">
        <Text>Loading...</Text>
        <ActivityIndicator
          animating={true}
          color={MD2Colors.orange600}
          size={"large"}
          theme={{ colors: { primary: "green" } }}
        />
      </View>
    );
  }

  return (
    <View className="w-full">
      <Appbar.Header className="w-full space-x-1 items-center justify-between">
        <TextInput
          placeholder="Scan your data..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleNew}
          className="w-4/6 p-1"
          ref={searchInput}
          left={<TextInput.Icon icon="qrcode-scan" />}
          mode="outlined"
        />
        <View className="w-2/6 items-center flex-row p-0">
          <Appbar.Action
            icon="printer-wireless"
            onPress={() => {
              showDialog();
            }}
            className=" bg-gray-300 rounded-full"
            size={18}
          />
          <Appbar.Action
            icon="check"
            onPress={() => {
              showPostDialog();
            }}
            className=" bg-green-300 rounded-full"
            size={18}
          />
        </View>
      </Appbar.Header>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Part No.</DataTable.Title>
          <DataTable.Title>Part Name</DataTable.Title>
          <DataTable.Title numeric>Quantity</DataTable.Title>
          {/* <DataTable.Title className="justify-center">Action</DataTable.Title> */}
        </DataTable.Header>

        {items.slice(from, to).map((item) => (
          <DataTable.Row
            key={item.id}
            className={`pt-2 ${currentRow === item.id ? "bg-orange-300" : ""}`}
            onPress={() => handleEditActionIconPress(item)}
          >
            <DataTable.Cell>{item.part}</DataTable.Cell>
            <DataTable.Cell>{item.name}</DataTable.Cell>
            <DataTable.Cell numeric>{item.qty}</DataTable.Cell>
          </DataTable.Row>
        ))}
        <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(items.length / itemsPerPage)}
          onPageChange={(page) => setPage(page)}
          label={`${from + 1}-${to} of ${items.length}`}
          numberOfItemsPerPageList={numberOfItemsPerPageList}
          numberOfItemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          showFastPaginationControls
          selectPageDropdownLabel={"Rows per page"}
        />
      </DataTable>
      <EditItemComponent
        data={dataEdit}
        visible={visibleEdit}
        onClose={handleCloseActionIconPress}
        onSave={updateItem}
        onDelete={handleDelete}
      />
      <PostInbound
        visible={postVisible}
        onClose={hidePostDialog}
        onConfirm={handleSend}
      />
      <PrintReceipt data={items} visible={visible} onClose={hideDialog} />
      <MessageBar
        message={message}
        visible={visibleSnack}
        onClose={hideSnack}
      />
    </View>
  );
};

export default Inbound;
