import { View, Text } from "react-native";
import { useState, useEffect, useRef } from "react";
import { StyleSheet } from 'react-native';
import { Appbar, FAB, useTheme, TextInput, DataTable } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MORE_ICON = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";
const BOTTOM_APPBAR_HEIGHT = 80;
const MEDIUM_FAB_HEIGHT = 56;

const Enquiry = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();
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
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Part No.</DataTable.Title>
          <DataTable.Title>Part Name</DataTable.Title>
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
        */
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
    </>
  );
};

const styles = StyleSheet.create({
  bottom: {
    backgroundColor: 'aquamarine',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
});

export default Enquiry;
