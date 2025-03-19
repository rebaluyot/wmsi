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
  Card,
  Avatar,
} from "react-native-paper";
import * as SQLite from "expo-sqlite";
import axios from "axios";
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";

const MORE_ICON = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";
const BOTTOM_APPBAR_HEIGHT = 80;
const MEDIUM_FAB_HEIGHT = 56;

const Enquiry = () => {
  const searchInput = useRef(null);
  const [page, setPage] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, items.length);

  return (
    <>
      <Appbar.Header className="w-full space-x-1 items-center justify-between">
        <TextInput
          placeholder="Scan or input part # here..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          //onSubmitEditing={handleNew}
          className="w-full p-1 mt-4"
          //ref={searchInput}
          left={<TextInput.Icon icon="qrcode-scan" />}
          right={<TextInput.Icon icon="magnify" />}
          mode="outlined"
        />
      </Appbar.Header>
      <Card.Title
        title="Part Number ...."
        subtitle="Part Name ....."
        left={(props) => <Avatar.Icon {...props} icon="check" />}
        right={(props) => (
          <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
        )}
      />
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Location</DataTable.Title>
          <DataTable.Title>Class</DataTable.Title>
          <DataTable.Title numeric>Quantity</DataTable.Title>
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
      <>
        <Text
          variant="headlineLarge"
        >
          Total: 101
        </Text>
      </>
    </>
  );
};

export default Enquiry;
